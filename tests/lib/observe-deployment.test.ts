import { describe, it, expect } from 'vitest'
import {
  isPublicIpv4,
  isPublicIpv6,
  isPublicAddress,
  validateObservationUrl,
  observeDeployment,
  type ObservationRequest,
  type ObservationRequestImpl,
} from '../../src/lib/observe-deployment.js'

const publicResolve = async () => [{ address: '93.184.216.34' }]

function fakeRequest(statusCode: number): ObservationRequestImpl {
  return async () => ({ statusCode })
}

describe('isPublicIpv4', () => {
  const blocked = [
    '127.0.0.1',        // loopback
    '10.0.0.1',         // RFC1918
    '172.16.0.1',       // RFC1918
    '172.31.255.255',   // RFC1918 upper edge
    '192.168.1.1',      // RFC1918
    '169.254.169.254',  // link-local / cloud metadata
    '100.64.0.1',       // CGNAT
    '0.0.0.0',          // unspecified
    '224.0.0.1',        // multicast
    '255.255.255.255',  // broadcast
    '198.18.0.1',       // benchmarking
  ]
  for (const ip of blocked) {
    it(`blocks ${ip}`, () => {
      expect(isPublicIpv4(ip)).toBe(false)
    })
  }

  const allowed = ['93.184.216.34', '8.8.8.8', '172.32.0.1', '100.128.0.1']
  for (const ip of allowed) {
    it(`allows ${ip}`, () => {
      expect(isPublicIpv4(ip)).toBe(true)
    })
  }
})

describe('isPublicIpv6', () => {
  const blocked = [
    '::1',                     // loopback
    '::',                      // unspecified
    'fe80::1',                 // link-local
    'fc00::1',                 // unique-local
    'fd12:3456::1',            // unique-local
    'ff02::1',                 // multicast
    '::ffff:192.168.1.1',      // IPv4-mapped private — unwrapped and blocked
    '::ffff:127.0.0.1',        // IPv4-mapped loopback
  ]
  for (const ip of blocked) {
    it(`blocks ${ip}`, () => {
      expect(isPublicIpv6(ip)).toBe(false)
    })
  }

  it('allows a public IPv6 address', () => {
    expect(isPublicIpv6('2606:2800:220:1:248:1893:25c8:1946')).toBe(true)
  })

  it('allows an IPv4-mapped public address', () => {
    expect(isPublicIpv6('::ffff:93.184.216.34')).toBe(true)
  })
})

describe('isPublicAddress', () => {
  it('rejects non-IP input', () => {
    expect(isPublicAddress('not-an-ip')).toBe(false)
  })
})

describe('validateObservationUrl', () => {
  it('accepts a plain public https URL', () => {
    expect(validateObservationUrl('https://app.example.com/health')).toBeNull()
  })

  const cases: Array<[string, string]> = [
    ['http://app.example.com', 'https_required'],
    ['https://app.example.com:8443', 'non_default_port'],
    ['https://user:pass@app.example.com', 'credentials_in_url'],
    ['https://93.184.216.34', 'ip_literal_not_allowed'],
    ['https://[::1]', 'ip_literal_not_allowed'],
    ['https://localhost', 'non_public_hostname'],
    ['https://foo.localhost', 'non_public_hostname'],
    ['https://printer.local', 'non_public_hostname'],
    ['https://db.internal', 'non_public_hostname'],
    ['https://intranet', 'non_public_hostname'],
    ['not a url', 'invalid_url'],
  ]
  for (const [url, reason] of cases) {
    it(`rejects ${url} (${reason})`, () => {
      expect(validateObservationUrl(url)).toBe(reason)
    })
  }
})

describe('observeDeployment', () => {
  it('records status and timing on success without following redirects', async () => {
    const obs = await observeDeployment(
      { url: 'https://app.example.com', health_path: '/health' },
      { resolve: publicResolve, requestImpl: fakeRequest(200) },
    )
    expect(obs.kind).toBe('http_check')
    expect(obs.method).toBe('proofslip_http_observation')
    expect(obs.url).toBe('https://app.example.com/health')
    expect(obs.status_code).toBe(200)
    expect(obs.response_time_ms).toBeTypeOf('number')
    expect(obs.error).toBeUndefined()
    expect(obs.note).toContain('Does not prove')
  })

  it('records a 3xx as the observed status instead of following it', async () => {
    const obs = await observeDeployment(
      { url: 'https://app.example.com' },
      { resolve: publicResolve, requestImpl: fakeRequest(308) },
    )
    expect(obs.status_code).toBe(308)
    expect(obs.error).toBeUndefined()
  })

  it('pins the connection to the validated address — DNS rebinding regression', async () => {
    let captured: ObservationRequest | undefined
    const obs = await observeDeployment(
      { url: 'https://app.example.com', health_path: '/health?probe=1' },
      {
        resolve: async () => [{ address: '93.184.216.34' }, { address: '93.184.216.35' }],
        requestImpl: async (req) => {
          captured = req
          return { statusCode: 200 }
        },
      },
    )
    expect(obs.status_code).toBe(200)
    // The request must go to the exact address that passed validation, with
    // TLS identity and Host still bound to the original hostname.
    expect(captured?.host).toBe('93.184.216.34')
    expect(captured?.servername).toBe('app.example.com')
    expect(captured?.headers.Host).toBe('app.example.com')
    expect(captured?.path).toBe('/health?probe=1')
  })

  it('blocks a hostname that resolves to a private address', async () => {
    const obs = await observeDeployment(
      { url: 'https://rebind.example.com' },
      { resolve: async () => [{ address: '10.0.0.5' }], requestImpl: fakeRequest(200) },
    )
    expect(obs.error).toBe('observation_failed')
    expect(obs.reason).toBe('private_address_blocked')
    expect(obs.status_code).toBeUndefined()
  })

  it('blocks when any resolved address is private', async () => {
    const obs = await observeDeployment(
      { url: 'https://mixed.example.com' },
      {
        resolve: async () => [{ address: '93.184.216.34' }, { address: '169.254.169.254' }],
        requestImpl: fakeRequest(200),
      },
    )
    expect(obs.reason).toBe('private_address_blocked')
  })

  it('records DNS resolution failure', async () => {
    const obs = await observeDeployment(
      { url: 'https://nxdomain.example.com' },
      { resolve: async () => { throw new Error('ENOTFOUND') }, requestImpl: fakeRequest(200) },
    )
    expect(obs.reason).toBe('dns_resolution_failed')
  })

  it('rejects a non-observable URL before any network access', async () => {
    let resolved = false
    const obs = await observeDeployment(
      { url: 'https://169.254.169.254/latest/meta-data' },
      {
        resolve: async () => { resolved = true; return [{ address: '169.254.169.254' }] },
        requestImpl: fakeRequest(200),
      },
    )
    expect(obs.reason).toBe('ip_literal_not_allowed')
    expect(resolved).toBe(false)
  })

  it('records a timeout distinctly from other connection failures', async () => {
    const obs = await observeDeployment(
      { url: 'https://slow.example.com' },
      {
        resolve: publicResolve,
        requestImpl: async () => { throw new Error('timeout') },
      },
    )
    expect(obs.error).toBe('observation_failed')
    expect(obs.reason).toBe('timeout')
  })

  it('records connection failure without throwing', async () => {
    const obs = await observeDeployment(
      { url: 'https://down.example.com' },
      {
        resolve: publicResolve,
        requestImpl: async () => { throw new Error('ECONNREFUSED') },
      },
    )
    expect(obs.error).toBe('observation_failed')
    expect(obs.reason).toBe('connection_failed')
  })
})
