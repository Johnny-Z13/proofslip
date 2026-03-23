const VALID_TYPES = ['action', 'approval', 'handshake', 'resume', 'failure'] as const

export type ReceiptType = typeof VALID_TYPES[number]

export interface CreateReceiptInput {
  type: ReceiptType
  status: string
  summary: string
  payload?: Record<string, unknown>
  ref?: {
    run_id?: string
    agent_id?: string
    action_id?: string
    workflow_id?: string
    session_id?: string
  }
  expires_in?: number
  idempotency_key?: string
}

export interface ValidationError {
  error: 'validation_error'
  message: string
}

export function validateCreateReceipt(body: unknown): CreateReceiptInput | ValidationError {
  if (!body || typeof body !== 'object') {
    return { error: 'validation_error', message: 'Request body must be a JSON object.' }
  }

  const b = body as Record<string, unknown>

  if (!b.type || typeof b.type !== 'string' || !VALID_TYPES.includes(b.type as any)) {
    return { error: 'validation_error', message: `type must be one of: ${VALID_TYPES.join(', ')}` }
  }

  if (!b.status || typeof b.status !== 'string') {
    return { error: 'validation_error', message: 'status is required and must be a string.' }
  }

  if (!b.summary || typeof b.summary !== 'string') {
    return { error: 'validation_error', message: 'summary is required and must be a string.' }
  }

  if (b.summary.length > 280) {
    return { error: 'validation_error', message: 'summary must be 280 characters or fewer.' }
  }

  if (b.payload !== undefined) {
    if (typeof b.payload !== 'object' || b.payload === null || Array.isArray(b.payload)) {
      return { error: 'validation_error', message: 'payload must be a JSON object.' }
    }
    if (JSON.stringify(b.payload).length > 4096) {
      return { error: 'validation_error', message: 'payload must be 4KB or smaller.' }
    }
  }

  if (b.ref !== undefined) {
    if (typeof b.ref !== 'object' || b.ref === null || Array.isArray(b.ref)) {
      return { error: 'validation_error', message: 'ref must be a JSON object.' }
    }
  }

  if (b.expires_in !== undefined) {
    if (typeof b.expires_in !== 'number' || b.expires_in < 60 || b.expires_in > 86400) {
      return { error: 'validation_error', message: 'expires_in must be between 60 and 86400 seconds.' }
    }
  }

  return {
    type: b.type as ReceiptType,
    status: b.status as string,
    summary: b.summary as string,
    payload: b.payload as Record<string, unknown> | undefined,
    ref: b.ref as CreateReceiptInput['ref'],
    expires_in: b.expires_in as number | undefined,
    idempotency_key: b.idempotency_key as string | undefined,
  }
}

export function isValidationError(result: CreateReceiptInput | ValidationError): result is ValidationError {
  return 'error' in result
}
