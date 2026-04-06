const TERMINAL_STATUSES = new Set([
  'approved',
  'rejected',
  'completed',
  'expired',
  'revoked',
  'failed',
  'failed_non_retryable',
  'success',
  'done',
  'denied',
  'cancelled',
  'connected',
  'disconnected',
])

export function isTerminal(type: string, status: string): boolean {
  if (type === 'action' || type === 'failure') return true
  if (type === 'resume') return true
  return TERMINAL_STATUSES.has(status)
}

export function getNextPollAfterSeconds(type: string, status: string): number | null {
  if (isTerminal(type, status)) return null

  if (type === 'approval') {
    if (status === 'pending' || status === 'awaiting_review') return 30
    return 15
  }

  if (type === 'handshake') {
    if (status === 'pending' || status === 'negotiating') return 10
    return 15
  }

  return 15
}
