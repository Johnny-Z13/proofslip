import { getDb } from '../db/client.js'
import { proofEvents } from '../db/schema.js'
import { generateProofEventId } from './ids.js'
import { sha256 } from './hash.js'

/**
 * Aggregate-only instrumentation for release proofs.
 * Private repository slugs are stored as SHA-256 digests; public slugs are
 * kept readable (documented in the privacy page). Never records tokens,
 * emails, IPs, or payload content. Failures never affect the request.
 */
export async function recordProofEvent(opts: {
  event:
    | 'release_proof_created'
    | 'release_proof_create_failed'
    | 'release_proof_viewed_html'
    | 'release_proof_fetched_json'
  reason?: string
  repository?: string
  repositoryVisibility?: string
}): Promise<void> {
  try {
    const digest = opts.repository
      ? opts.repositoryVisibility === 'public'
        ? opts.repository
        : sha256(opts.repository)
      : null

    await getDb().insert(proofEvents).values({
      id: generateProofEventId(),
      event: opts.event,
      reason: opts.reason ?? null,
      repositoryDigest: digest,
      repositoryVisibility: opts.repositoryVisibility ?? null,
    })
  } catch {
    // Instrumentation must never break the request path.
  }
}
