import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolve } from 'node:path'
import { main, resolveTarget, validateProof } from '../../.agents/skills/proofslip-release-proof/scripts/verify-proof.mjs'

const script = resolve('.agents/skills/proofslip-release-proof/scripts/verify-proof.mjs')
const originalArgv = [...process.argv]

function fixture(overrides: Record<string, unknown> = {}) {
  return {
    proof_id: 'prf_test',
    proof_url: 'https://proofslip.ai/proof/prf_test',
    schema_version: 'release-proof/v1',
    is_valid: true,
    is_expired: false,
    trust_level: 'provider_verified',
    verification_method: 'github_actions_oidc',
    issuer: {
      type: 'github_actions',
      repository: 'z13labs/example',
      repository_id: '123',
      repository_owner: 'z13labs',
      repository_owner_id: '456',
      repository_visibility: 'public',
      sha: 'a'.repeat(40),
      ref: 'refs/heads/main',
      workflow_ref: 'z13labs/example/.github/workflows/release.yml@refs/heads/main',
      run_id: '1234',
      run_attempt: 1,
      actor: 'release-bot',
      event_name: 'push',
      subject: 'repo:z13labs/example:ref:refs/heads/main',
      run_url: 'https://github.com/z13labs/example/actions/runs/1234',
      commit_url: `https://github.com/z13labs/example/commit/${'a'.repeat(40)}`,
    },
    observations: [{
      kind: 'http_check',
      method: 'proofslip_http_observation',
      url: 'https://example.com/health',
      status_code: 200,
      response_time_ms: 42,
      observed_at: '2026-07-19T10:00:00.000Z',
      note: 'Status observed by ProofSlip at issuance time.',
    }],
    submitted_context: { environment: 'production' },
    issued_at: '2026-07-19T10:00:00.000Z',
    expires_at: '2026-10-17T10:00:00.000Z',
    ...overrides,
  }
}

async function run(body: unknown, status = 200) {
  let stdout = ''
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })))
  vi.spyOn(process.stdout, 'write').mockImplementation((chunk: string | Uint8Array) => {
    stdout += String(chunk)
    return true
  })
  process.argv = [process.execPath, script, 'prf_test', '--base-url', 'http://localhost']
  process.exitCode = undefined
  await main()
  return { exitCode: process.exitCode ?? 0, stdout }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  process.argv = [...originalArgv]
  process.exitCode = undefined
})

describe('proofslip-release-proof verification script', () => {
  it('accepts canonical proof IDs and rejects unrelated URLs', () => {
    expect(resolveTarget('prf_test', 'https://proofslip.ai').endpoint).toBe('https://proofslip.ai/v1/proofs/prf_test')
    expect(() => resolveTarget('https://example.com/not-a-proof', 'https://proofslip.ai')).toThrow('not a ProofSlip proof URL')
  })

  it('rejects malformed proof responses', () => {
    expect(() => validateProof({ schema_version: 'release-proof/v1', proof_id: 'prf_test' })).toThrow('Missing proof_url')
  })

  it('fails closed on required proof types and provider evidence', () => {
    expect(() => validateProof(fixture({ is_valid: 'false' }))).toThrow('is_valid must be a boolean')
    expect(() => validateProof(fixture({ proof_url: undefined }))).toThrow('Missing proof_url')
    expect(() => validateProof(fixture({ trust_level: undefined }))).toThrow('Unsupported trust_level')
    expect(() => validateProof(fixture({
      issuer: { ...fixture().issuer, actor: undefined },
    }))).toThrow('Missing issuer.actor')
  })

  it('reports verified evidence lanes without merging submitted context', async () => {
    const result = await run(fixture())
    expect(result.exitCode).toBe(0)
    const output = JSON.parse(result.stdout)
    expect(output.verdict).toBe('verified')
    expect(output.source_endpoint).toBe('http://localhost/v1/proofs/prf_test')
    expect(output.provider_verified.repository).toBe('z13labs/example')
    expect(output.proofslip_observations[0].status_code).toBe(200)
    expect(output.submitted_not_verified).toEqual({ environment: 'production' })
    expect(output.limitations).toHaveLength(3)
  })

  it('returns a distinct nonzero result for expired proof evidence', async () => {
    const result = await run(fixture({ is_valid: false, is_expired: true }), 410)
    expect(result.exitCode).toBe(2)
    expect(JSON.parse(result.stdout).verdict).toBe('expired')
  })
})
