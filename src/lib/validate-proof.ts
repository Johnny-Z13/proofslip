import { validateObservationUrl } from './observe-deployment.js'

export const PROOF_SCHEMA_VERSION = 'release-proof/v1'

export interface CreateProofInput {
  schema_version: typeof PROOF_SCHEMA_VERSION
  idempotency_key?: string
  deployment?: { url: string; health_path?: string }
  submitted_context?: Record<string, string>
}

export interface ProofValidationError {
  error: 'validation_error'
  message: string
}

export function validateCreateProof(body: unknown): CreateProofInput | ProofValidationError {
  // The entire body is optional — a bare OIDC-authenticated POST is a valid proof request.
  const b = (body ?? {}) as Record<string, unknown>
  if (typeof b !== 'object' || Array.isArray(b)) {
    return { error: 'validation_error', message: 'Request body must be a JSON object.' }
  }

  if (b.schema_version !== undefined && b.schema_version !== PROOF_SCHEMA_VERSION) {
    return { error: 'validation_error', message: `schema_version must be "${PROOF_SCHEMA_VERSION}".` }
  }

  if (b.idempotency_key !== undefined) {
    if (typeof b.idempotency_key !== 'string' || !b.idempotency_key.trim()) {
      return { error: 'validation_error', message: 'idempotency_key must be a non-empty string.' }
    }
    if (b.idempotency_key.length > 255) {
      return { error: 'validation_error', message: 'idempotency_key must be 255 characters or fewer.' }
    }
  }

  let deployment: CreateProofInput['deployment']
  if (b.deployment !== undefined) {
    const d = b.deployment as Record<string, unknown>
    if (typeof d !== 'object' || d === null || Array.isArray(d)) {
      return { error: 'validation_error', message: 'deployment must be a JSON object.' }
    }
    if (typeof d.url !== 'string' || d.url.length === 0 || d.url.length > 512) {
      return { error: 'validation_error', message: 'deployment.url must be a string of 512 characters or fewer.' }
    }
    if (d.health_path !== undefined) {
      if (typeof d.health_path !== 'string' || !d.health_path.startsWith('/') || d.health_path.length > 256) {
        return { error: 'validation_error', message: 'deployment.health_path must be a path starting with "/" of 256 characters or fewer.' }
      }
    }
    const urlError = validateObservationUrl(d.url)
    if (urlError) {
      return { error: 'validation_error', message: `deployment.url is not observable (${urlError}). Use a public https URL without credentials, port, or IP literal.` }
    }
    deployment = { url: d.url, health_path: d.health_path as string | undefined }
  }

  let submittedContext: Record<string, string> | undefined
  if (b.submitted_context !== undefined) {
    const s = b.submitted_context as Record<string, unknown>
    if (typeof s !== 'object' || s === null || Array.isArray(s)) {
      return { error: 'validation_error', message: 'submitted_context must be a JSON object.' }
    }
    const entries = Object.entries(s)
    if (entries.length > 10) {
      return { error: 'validation_error', message: 'submitted_context may contain at most 10 entries.' }
    }
    for (const [key, value] of entries) {
      if (typeof value !== 'string') {
        return { error: 'validation_error', message: 'submitted_context values must be strings.' }
      }
      if (key.length > 64 || value.length > 256) {
        return { error: 'validation_error', message: 'submitted_context keys must be ≤64 chars and values ≤256 chars.' }
      }
    }
    if (JSON.stringify(s).length > 1024) {
      return { error: 'validation_error', message: 'submitted_context must serialize to 1KB or less.' }
    }
    submittedContext = s as Record<string, string>
  }

  return {
    schema_version: PROOF_SCHEMA_VERSION,
    idempotency_key: b.idempotency_key as string | undefined,
    deployment,
    submitted_context: submittedContext,
  }
}

export function isProofValidationError(
  result: CreateProofInput | ProofValidationError,
): result is ProofValidationError {
  return 'error' in result
}
