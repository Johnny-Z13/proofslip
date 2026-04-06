import type {
  CreateReceiptInput,
  Receipt,
  VerifyResult,
  StatusResult,
  SignupResult,
} from './types.js'
import { ProofSlipError } from './errors.js'

export interface ProofSlipClientOptions {
  apiKey?: string
  baseUrl?: string
}

export class ProofSlipClient {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor(opts?: ProofSlipClientOptions) {
    this.apiKey = opts?.apiKey ?? process.env.PROOFSLIP_API_KEY
    this.baseUrl = opts?.baseUrl ?? process.env.PROOFSLIP_BASE_URL ?? 'https://proofslip.ai'
  }

  hasApiKey(): boolean {
    return !!this.apiKey
  }

  async createReceipt(input: CreateReceiptInput): Promise<Receipt> {
    return this.post<Receipt>('/v1/receipts', input, true)
  }

  async verifyReceipt(receiptId: string): Promise<VerifyResult> {
    return this.get<VerifyResult>(`/v1/verify/${encodeURIComponent(receiptId)}?format=json`)
  }

  async checkStatus(receiptId: string): Promise<StatusResult> {
    return this.get<StatusResult>(`/v1/receipts/${encodeURIComponent(receiptId)}/status`)
  }

  async signup(email: string): Promise<SignupResult> {
    return this.post<SignupResult>('/v1/auth/signup', { email, source: 'api' }, false)
  }

  async waitForTerminal(
    receiptId: string,
    opts?: {
      maxAttempts?: number
      onPoll?: (status: StatusResult) => void
    },
  ): Promise<StatusResult> {
    const maxAttempts = opts?.maxAttempts ?? 20
    let attempts = 0

    while (attempts < maxAttempts) {
      const status = await this.checkStatus(receiptId)
      attempts++
      opts?.onPoll?.(status)

      if (status.is_terminal) {
        return status
      }

      if (attempts >= maxAttempts) {
        break
      }

      const delay = (status.next_poll_after_seconds ?? 15) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    throw new ProofSlipError(
      `Receipt ${receiptId} did not reach terminal state after ${maxAttempts} attempts`,
      'poll_timeout',
      0,
    )
  }

  private async get<T>(path: string): Promise<T> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) {
        throw new ProofSlipError(
          data.message ?? `Request failed with status ${res.status}`,
          data.error ?? 'request_failed',
          res.status,
          data.request_id,
        )
      }
      return data as T
    } catch (err) {
      if (err instanceof ProofSlipError) throw err
      throw new ProofSlipError(
        err instanceof Error ? err.message : 'Network error',
        'network_error',
        0,
      )
    }
  }

  private async post<T>(path: string, body: unknown, auth: boolean): Promise<T> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }
      if (auth && this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`
      }
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new ProofSlipError(
          data.message ?? `Request failed with status ${res.status}`,
          data.error ?? 'request_failed',
          res.status,
          data.request_id,
        )
      }
      return data as T
    } catch (err) {
      if (err instanceof ProofSlipError) throw err
      throw new ProofSlipError(
        err instanceof Error ? err.message : 'Network error',
        'network_error',
        0,
      )
    }
  }
}
