export type ApiResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string; message: string; status: number };

export class ProofSlipClient {
  constructor(
    private baseUrl: string,
    private apiKey?: string,
  ) {}

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  async createReceipt(input: {
    type: string;
    status: string;
    summary: string;
    payload?: Record<string, unknown>;
    ref?: Record<string, string | undefined>;
    expires_in?: number;
    idempotency_key?: string;
    audience?: string;
  }): Promise<ApiResult> {
    return this.post('/v1/receipts', input, true);
  }

  async verifyReceipt(receiptId: string): Promise<ApiResult> {
    return this.get(`/v1/verify/${encodeURIComponent(receiptId)}?format=json`);
  }

  async checkStatus(receiptId: string): Promise<ApiResult> {
    return this.get(
      `/v1/receipts/${encodeURIComponent(receiptId)}/status`,
    );
  }

  async signup(email: string): Promise<ApiResult> {
    return this.post('/v1/auth/signup', { email, source: 'api' }, false);
  }

  private async get(path: string): Promise<ApiResult> {
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error ?? 'request_failed',
          message: data.message ?? `Request failed with status ${res.status}`,
          status: res.status,
        };
      }
      return { ok: true, data };
    } catch (err) {
      return {
        ok: false,
        error: 'network_error',
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      };
    }
  }

  private async post(
    path: string,
    body: unknown,
    auth: boolean,
  ): Promise<ApiResult> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (auth && this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          error: data.error ?? 'request_failed',
          message: data.message ?? `Request failed with status ${res.status}`,
          status: res.status,
        };
      }
      return { ok: true, data };
    } catch (err) {
      return {
        ok: false,
        error: 'network_error',
        message: err instanceof Error ? err.message : 'Network error',
        status: 0,
      };
    }
  }
}
