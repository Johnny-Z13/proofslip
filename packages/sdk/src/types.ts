export type ReceiptType = 'action' | 'approval' | 'handshake' | 'resume' | 'failure'

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
  audience?: 'human'
}

export interface Receipt {
  receipt_id: string
  type: ReceiptType
  status: string
  summary: string
  verify_url: string
  created_at: string
  expires_at: string
  idempotency_key: string | null
  audience?: string
  is_terminal: boolean
  next_poll_after_seconds: number | null
}

export interface VerifyResult {
  receipt_id: string
  valid: boolean
  type: ReceiptType
  status: string
  summary: string
  payload: Record<string, unknown> | null
  ref: Record<string, unknown> | null
  created_at: string
  expires_at: string
  expired: boolean
  is_terminal: boolean
  next_poll_after_seconds: number | null
}

export interface StatusResult {
  receipt_id: string
  status: string
  is_terminal: boolean
  next_poll_after_seconds: number | null
  expires_at: string
}

export interface SignupResult {
  api_key: string
  tier: string
  message: string
}
