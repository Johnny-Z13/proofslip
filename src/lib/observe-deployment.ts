import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { request as httpsRequest } from 'node:https'
import { checkServerIdentity as tlsCheckServerIdentity } from 'node:tls'

/**
 * Safe, one-shot HTTP observation of a deployment URL for release-proof/v1.
 *
 * Policy (see docs/specs/release-proof-v1.md):
 * - https only, default port only
 * - hostname must not be an IP literal and must not resolve to a private,
 *   loopback, link-local, metadata, CGNAT, or otherwise non-public address
 * - the connection is PINNED to the validated address — the request goes to
 *   the exact IP that passed the check, so a DNS rebind between check and
 *   connect cannot redirect it (TLS still verifies the original hostname)
 * - redirects are never followed; a 3xx is recorded as the observed status
 * - the response body is never read; only status code and timing are recorded
 * - 5 second timeout
 */

const OBSERVATION_TIMEOUT_MS = 5000

export interface HttpObservation {
  kind: 'http_check'
  method: 'proofslip_http_observation'
  url: string
  status_code?: number
  response_time_ms?: number
  observed_at: string
  error?: 'observation_failed'
  reason?: string
  note: string
}

const OBSERVATION_NOTE =
  'Status observed by ProofSlip at issuance time. Does not prove the deployment contains the claimed commit.'

function ipv4ToNumber(ip: string): number {
  const parts = ip.split('.').map(Number)
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function inCidr4(ip: number, base: string, maskBits: number): boolean {
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0
  return (ip & mask) === (ipv4ToNumber(base) & mask)
}

export function isPublicIpv4(ip: string): boolean {
  const n = ipv4ToNumber(ip)
  const blocked: Array<[string, number]> = [
    ['0.0.0.0', 8],        // unspecified / "this network"
    ['10.0.0.0', 8],       // RFC1918
    ['100.64.0.0', 10],    // CGNAT
    ['127.0.0.0', 8],      // loopback
    ['169.254.0.0', 16],   // link-local (cloud metadata services)
    ['172.16.0.0', 12],    // RFC1918
    ['192.0.0.0', 24],     // IETF protocol assignments
    ['192.168.0.0', 16],   // RFC1918
    ['198.18.0.0', 15],    // benchmarking
    ['224.0.0.0', 4],      // multicast
    ['240.0.0.0', 4],      // reserved + broadcast
  ]
  return !blocked.some(([base, bits]) => inCidr4(n, base, bits))
}

export function isPublicIpv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  // IPv4-mapped (::ffff:a.b.c.d) — unwrap and check as IPv4
  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPublicIpv4(mapped[1])

  if (lower === '::' || lower === '::1') return false          // unspecified / loopback
  if (lower.startsWith('fe8') || lower.startsWith('fe9') ||
      lower.startsWith('fea') || lower.startsWith('feb')) return false // link-local fe80::/10
  if (lower.startsWith('fc') || lower.startsWith('fd')) return false  // unique-local fc00::/7
  if (lower.startsWith('ff')) return false                     // multicast
  return true
}

export function isPublicAddress(ip: string): boolean {
  const family = isIP(ip)
  if (family === 4) return isPublicIpv4(ip)
  if (family === 6) return isPublicIpv6(ip)
  return false
}

export interface DeploymentTarget {
  url: string
  health_path?: string
}

/** The exact URL an observation of this target records (url + health_path). */
export function buildObservationUrl(target: DeploymentTarget): string {
  return `${target.url.replace(/\/$/, '')}${target.health_path ?? ''}`
}

/** A single pinned-address HTTPS request: connect to `host` (a validated IP), verify TLS against `servername`. */
export interface ObservationRequest {
  host: string
  servername: string
  path: string
  headers: Record<string, string>
  timeoutMs: number
}

export type ObservationRequestImpl = (req: ObservationRequest) => Promise<{ statusCode: number }>

const pinnedHttpsRequest: ObservationRequestImpl = (req) =>
  new Promise((resolve, reject) => {
    const r = httpsRequest(
      {
        host: req.host,
        servername: req.servername,
        path: req.path,
        method: 'GET',
        headers: req.headers,
        timeout: req.timeoutMs,
        // We connect by IP; verify the certificate against the original hostname.
        checkServerIdentity: (_host, cert) => tlsCheckServerIdentity(req.servername, cert),
      },
      (res) => {
        const statusCode = res.statusCode ?? 0
        res.destroy() // never read the body
        resolve({ statusCode })
      },
    )
    r.on('timeout', () => r.destroy(new Error('timeout')))
    r.on('error', reject)
    r.end()
  })

/** Validate the target URL shape without any network access. Returns an error reason or null. */
export function validateObservationUrl(rawUrl: string): string | null {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return 'invalid_url'
  }
  if (url.protocol !== 'https:') return 'https_required'
  if (url.port !== '') return 'non_default_port'
  if (url.username || url.password) return 'credentials_in_url'
  if (isIP(url.hostname.replace(/^\[|\]$/g, '')) !== 0) return 'ip_literal_not_allowed'
  if (url.hostname === 'localhost' || url.hostname.endsWith('.localhost') ||
      url.hostname.endsWith('.local') || url.hostname.endsWith('.internal') ||
      !url.hostname.includes('.')) {
    return 'non_public_hostname'
  }
  return null
}

export async function observeDeployment(
  target: DeploymentTarget,
  deps?: {
    resolve?: (hostname: string) => Promise<Array<{ address: string }>>
    requestImpl?: ObservationRequestImpl
  },
): Promise<HttpObservation> {
  const observedAt = new Date().toISOString()
  const fullUrl = buildObservationUrl(target)

  const fail = (reason: string): HttpObservation => ({
    kind: 'http_check',
    method: 'proofslip_http_observation',
    url: fullUrl,
    observed_at: observedAt,
    error: 'observation_failed',
    reason,
    note: OBSERVATION_NOTE,
  })

  const urlError = validateObservationUrl(fullUrl)
  if (urlError) return fail(urlError)

  const parsed = new URL(fullUrl)
  const { hostname } = parsed

  // Resolve once, validate every address, then PIN the connection to a
  // validated address — never let the HTTP client re-resolve (DNS rebinding).
  let pinnedAddress: string
  try {
    const resolve = deps?.resolve ?? ((h: string) => lookup(h, { all: true }))
    const addresses = await resolve(hostname)
    if (addresses.length === 0) return fail('dns_no_records')
    if (!addresses.every((a) => isPublicAddress(a.address))) {
      return fail('private_address_blocked')
    }
    pinnedAddress = addresses[0].address
  } catch {
    return fail('dns_resolution_failed')
  }

  const startedAt = Date.now()
  try {
    const requestImpl = deps?.requestImpl ?? pinnedHttpsRequest
    const res = await requestImpl({
      host: pinnedAddress,
      servername: hostname,
      path: `${parsed.pathname}${parsed.search}`,
      headers: { Host: hostname, 'User-Agent': 'ProofSlip-Observer/1' },
      timeoutMs: OBSERVATION_TIMEOUT_MS,
    })
    const elapsed = Date.now() - startedAt

    return {
      kind: 'http_check',
      method: 'proofslip_http_observation',
      url: fullUrl,
      status_code: res.statusCode,
      response_time_ms: elapsed,
      observed_at: observedAt,
      note: OBSERVATION_NOTE,
    }
  } catch (err) {
    const timedOut = err instanceof Error && err.message === 'timeout'
    return fail(timedOut ? 'timeout' : 'connection_failed')
  }
}
