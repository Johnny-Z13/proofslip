#!/usr/bin/env node

import { pathToFileURL } from 'node:url'

const MAX_RESPONSE_BYTES = 1024 * 1024
const DEFAULT_BASE_URL = 'https://proofslip.ai'

function fail(message, details) {
  const result = { verdict: 'unverifiable', message }
  if (details) result.details = details
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
  process.exitCode = 1
}

function parseArgs(argv) {
  let target
  let baseUrl = process.env.PROOFSLIP_BASE_URL || DEFAULT_BASE_URL

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--base-url') {
      baseUrl = argv[index + 1]
      index += 1
    } else if (!target) {
      target = value
    } else {
      throw new Error(`Unexpected argument: ${value}`)
    }
  }

  if (!target) throw new Error('Usage: verify-proof.mjs <proof-id-or-url> [--base-url https://host]')
  return { target, baseUrl }
}

function normalizeBaseUrl(value) {
  const url = new URL(value)
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error('The base URL must use HTTPS unless it is localhost.')
  }
  url.pathname = ''
  url.search = ''
  url.hash = ''
  return url.toString().replace(/\/$/, '')
}

export function resolveTarget(target, explicitBaseUrl) {
  let proofId = target
  let baseUrl = normalizeBaseUrl(explicitBaseUrl)

  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target)
    const match = url.pathname.match(/^\/(?:proof|v1\/proofs)\/(prf_[A-Za-z0-9_-]+)\/?$/)
    if (!match) throw new Error('The URL is not a ProofSlip proof URL.')
    proofId = match[1]

    const targetBase = normalizeBaseUrl(url.origin)
    const defaultBase = normalizeBaseUrl(DEFAULT_BASE_URL)
    if (targetBase !== defaultBase && targetBase !== baseUrl) {
      throw new Error('For a self-hosted proof URL, pass its origin explicitly with --base-url.')
    }
    baseUrl = targetBase
  }

  if (!/^prf_[A-Za-z0-9_-]+$/.test(proofId)) throw new Error('Invalid ProofSlip proof ID.')
  return { proofId, endpoint: `${baseUrl}/v1/proofs/${encodeURIComponent(proofId)}` }
}

export function validateProof(value) {
  if (!value || typeof value !== 'object') throw new Error('Proof response must be a JSON object.')
  if (value.schema_version !== 'release-proof/v1') throw new Error('Unsupported proof schema.')
  if (typeof value.proof_id !== 'string' || !/^prf_[A-Za-z0-9_-]+$/.test(value.proof_id)) throw new Error('Missing or invalid proof_id.')
  requireUrl(value.proof_url, 'proof_url')
  if (typeof value.is_valid !== 'boolean') throw new Error('is_valid must be a boolean.')
  if (typeof value.is_expired !== 'boolean') throw new Error('is_expired must be a boolean.')
  if (value.is_valid === value.is_expired) throw new Error('is_valid and is_expired are inconsistent.')
  if (value.trust_level !== 'provider_verified') throw new Error('Unsupported trust_level.')
  if (value.verification_method !== 'github_actions_oidc') throw new Error('Unsupported verification_method.')
  if (!value.issuer || typeof value.issuer !== 'object') throw new Error('Missing issuer evidence.')
  if (value.issuer.type !== 'github_actions') throw new Error('Unsupported issuer.type.')
  for (const field of [
    'repository', 'repository_id', 'repository_owner', 'repository_owner_id',
    'repository_visibility', 'ref', 'sha', 'workflow_ref', 'run_id', 'actor',
    'event_name', 'subject',
  ]) {
    requireString(value.issuer[field], `issuer.${field}`)
  }
  if (!/^[a-f0-9]{40}$/i.test(value.issuer.sha)) throw new Error('issuer.sha must be a 40-character Git commit SHA.')
  if (!Number.isInteger(value.issuer.run_attempt) || value.issuer.run_attempt < 1) throw new Error('issuer.run_attempt must be a positive integer.')
  requireUrl(value.issuer.run_url, 'issuer.run_url')
  requireUrl(value.issuer.commit_url, 'issuer.commit_url')
  if (!Array.isArray(value.observations)) throw new Error('observations must be an array.')
  value.observations.forEach(validateObservation)
  validateSubmittedContext(value.submitted_context)
  const issuedAt = requireTimestamp(value.issued_at, 'issued_at')
  const expiresAt = requireTimestamp(value.expires_at, 'expires_at')
  if (expiresAt <= issuedAt) throw new Error('expires_at must be later than issued_at.')
  return value
}

function requireString(value, field) {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`Missing ${field}.`)
  return value
}

function requireUrl(value, field) {
  requireString(value, field)
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`${field} must be an absolute URL.`)
  }
  if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
    throw new Error(`${field} must use HTTPS unless it is localhost.`)
  }
  return url
}

function requireTimestamp(value, field) {
  requireString(value, field)
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) throw new Error(`${field} must be a valid timestamp.`)
  return timestamp
}

function validateObservation(observation, index) {
  const prefix = `observations[${index}]`
  if (!observation || typeof observation !== 'object' || Array.isArray(observation)) throw new Error(`${prefix} must be an object.`)
  if (observation.kind !== 'http_check') throw new Error(`${prefix}.kind is unsupported.`)
  if (observation.method !== 'proofslip_http_observation') throw new Error(`${prefix}.method is unsupported.`)
  requireUrl(observation.url, `${prefix}.url`)
  requireTimestamp(observation.observed_at, `${prefix}.observed_at`)
  requireString(observation.note, `${prefix}.note`)
  const hasStatus = Number.isInteger(observation.status_code) && observation.status_code >= 100 && observation.status_code <= 599
  const hasFailure = observation.error === 'observation_failed' && typeof observation.reason === 'string' && observation.reason.length > 0
  if (!hasStatus && !hasFailure) throw new Error(`${prefix} must contain a valid status or observation failure.`)
  if (observation.response_time_ms !== undefined && (!Number.isInteger(observation.response_time_ms) || observation.response_time_ms < 0)) {
    throw new Error(`${prefix}.response_time_ms must be a non-negative integer.`)
  }
}

function validateSubmittedContext(value) {
  if (value === null) return
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('submitted_context must be an object or null.')
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry !== 'string') throw new Error(`submitted_context.${key} must be a string.`)
  }
}

export async function main() {
  const { target, baseUrl } = parseArgs(process.argv.slice(2))
  const { proofId, endpoint } = resolveTarget(target, baseUrl)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)

  let response
  try {
    response = await fetch(endpoint, {
      headers: { Accept: 'application/json', Connection: 'close' },
      redirect: 'error',
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }

  const contentLength = Number(response.headers.get('content-length') || 0)
  if (contentLength > MAX_RESPONSE_BYTES) throw new Error('Proof response is too large.')
  const body = await response.text()
  if (Buffer.byteLength(body, 'utf8') > MAX_RESPONSE_BYTES) throw new Error('Proof response is too large.')

  let parsed
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error(`ProofSlip returned non-JSON data (${response.status}).`)
  }

  if (!response.ok && response.status !== 410) {
    throw new Error(`ProofSlip returned ${response.status}: ${parsed.message || parsed.error || 'request failed'}`)
  }

  const proof = validateProof(parsed)
  if (proof.proof_id !== proofId) throw new Error('Returned proof ID does not match the requested proof.')

  const verdict = proof.is_expired ? 'expired' : proof.is_valid ? 'verified' : 'invalid'
  const output = {
    verdict,
    source_endpoint: endpoint,
    proof_id: proof.proof_id,
    proof_url: proof.proof_url,
    schema_version: proof.schema_version,
    trust_level: proof.trust_level,
    verification_method: proof.verification_method,
    provider_verified: proof.issuer,
    proofslip_observations: Array.isArray(proof.observations) ? proof.observations : [],
    submitted_not_verified: proof.submitted_context ?? null,
    issued_at: proof.issued_at,
    expires_at: proof.expires_at,
    limitations: [
      'GitHub OIDC proves the identity and execution context of the job that requested the token, not that every test passed.',
      'An HTTP observation proves only the response ProofSlip saw at the recorded time, not the deployed commit contents.',
      'Submitted context is not independently verified.',
    ],
  }

  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
  if (verdict !== 'verified') process.exitCode = 2
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => fail(error instanceof Error ? error.message : String(error)))
}
