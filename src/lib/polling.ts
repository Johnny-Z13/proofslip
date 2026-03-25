/**
 * Polling guidance engine.
 *
 * Determines whether a receipt is terminal (stop polling) and
 * suggests a next poll interval based on type + status.
 */

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
  'connected',    // handshake established
  'disconnected', // handshake ended
])

/**
 * Returns true if this receipt should never be polled again.
 * Terminal = the state will not change before expiry.
 */
export function isTerminal(type: string, status: string): boolean {
  // Action and failure receipts are always terminal — they record a completed event
  if (type === 'action' || type === 'failure') return true
  // Resume receipts are one-shot signals
  if (type === 'resume') return true

  return TERMINAL_STATUSES.has(status)
}

/**
 * Returns recommended seconds until the client should poll again.
 * null = don't poll (terminal state).
 */
export function getNextPollAfterSeconds(type: string, status: string): number | null {
  if (isTerminal(type, status)) return null

  // Approval receipts awaiting human review — humans are slow
  if (type === 'approval') {
    if (status === 'pending' || status === 'awaiting_review') return 30
    return 15
  }

  // Handshake receipts — typically short-lived negotiation
  if (type === 'handshake') {
    if (status === 'pending' || status === 'negotiating') return 10
    return 15
  }

  // Default for any non-terminal state
  return 15
}
