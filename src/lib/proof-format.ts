import type { proofs } from '../db/schema.js'
import type { StoredGitHubActionsClaims } from './github-oidc.js'

export type ProofRow = typeof proofs.$inferSelect

/**
 * Public JSON shape for a release proof. Used by the API routes and as the
 * data source for the human view — one builder so the trust categories can
 * never drift between surfaces.
 */
export interface ProofResponse {
  proof_id: string
  proof_url: string
  schema_version: string
  is_valid: boolean
  is_expired: boolean
  trust_level: 'provider_verified'
  verification_method: 'github_actions_oidc'
  issuer: {
    type: 'github_actions'
    repository: string
    repository_id: string
    repository_owner: string
    repository_owner_id: string
    repository_visibility: string
    ref: string
    sha: string
    workflow_ref: string
    run_id: string
    run_attempt: number
    actor: string
    event_name: string
    subject: string
    run_url: string
    commit_url: string
  }
  observations: unknown[]
  submitted_context: Record<string, string> | null
  issued_at: string
  expires_at: string
}

export function buildProofResponse(row: ProofRow): ProofResponse {
  const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'
  const claims = row.issuerClaims as unknown as StoredGitHubActionsClaims
  const isExpired = row.expiresAt < new Date()

  return {
    proof_id: row.id,
    proof_url: `${baseUrl}/proof/${row.id}`,
    schema_version: row.schemaVersion,
    is_valid: !isExpired,
    is_expired: isExpired,
    trust_level: 'provider_verified',
    verification_method: 'github_actions_oidc',
    issuer: {
      type: 'github_actions',
      repository: claims.repository,
      repository_id: claims.repositoryId,
      repository_owner: claims.repositoryOwner,
      repository_owner_id: claims.repositoryOwnerId,
      repository_visibility: claims.repositoryVisibility,
      ref: claims.ref,
      sha: claims.sha,
      workflow_ref: claims.workflowRef,
      run_id: claims.runId,
      run_attempt: claims.runAttempt,
      actor: claims.actor,
      event_name: claims.eventName,
      subject: claims.subject,
      run_url: `https://github.com/${claims.repository}/actions/runs/${claims.runId}`,
      commit_url: `https://github.com/${claims.repository}/commit/${claims.sha}`,
    },
    observations: (row.observations as unknown[]) ?? [],
    submitted_context: (row.submittedContext as Record<string, string> | null) ?? null,
    issued_at: row.issuedAt.toISOString(),
    expires_at: row.expiresAt.toISOString(),
  }
}
