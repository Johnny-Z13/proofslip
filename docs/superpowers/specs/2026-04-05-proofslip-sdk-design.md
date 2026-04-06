# @proofslip/sdk — Design Spec

Thin JS/TS client library for the ProofSlip API. Wraps all public endpoints with typed methods, throws on errors, and includes a polling helper for non-terminal receipts. Becomes the shared client that `@proofslip/mcp-server` depends on.

## Decisions

- **Shared dependency:** SDK replaces the MCP server's internal client. One client to maintain.
- **Throws on error:** No Result types. Methods return data or throw `ProofSlipError`.
- **Mirror + polling:** 4 core methods matching the API, plus `waitForTerminal()` convenience method.
- **No extras in v1:** No client-side validation, retry logic, caching, or streaming.

## API Surface

```typescript
class ProofSlipClient {
  constructor(opts?: { apiKey?: string; baseUrl?: string })

  createReceipt(input: CreateReceiptInput): Promise<Receipt>
  verifyReceipt(receiptId: string): Promise<VerifyResult>
  checkStatus(receiptId: string): Promise<StatusResult>
  signup(email: string): Promise<SignupResult>

  waitForTerminal(receiptId: string, opts?: {
    maxAttempts?: number    // default 20
    onPoll?: (status: StatusResult) => void
  }): Promise<StatusResult>
}
```

### Constructor

- `apiKey` — optional, falls back to `PROOFSLIP_API_KEY` env var
- `baseUrl` — optional, falls back to `PROOFSLIP_BASE_URL` env var, then `https://proofslip.ai`
- No API key required for `verifyReceipt`, `checkStatus`, or `signup`

### Core Methods

**`createReceipt(input)`** — `POST /v1/receipts`
- Requires API key (throws if not configured)
- Returns full receipt object with `receipt_id`, `verify_url`, `expires_at`, etc.

**`verifyReceipt(receiptId)`** — `GET /v1/verify/{id}?format=json`
- Public, no auth needed
- Returns receipt data including `valid`, `payload`, `ref`, `expired`

**`checkStatus(receiptId)`** — `GET /v1/receipts/{id}/status`
- Public, no auth needed
- Lightweight — returns only `status`, `is_terminal`, `next_poll_after_seconds`, `expires_at`

**`signup(email)`** — `POST /v1/auth/signup`
- Public, no auth needed
- Sends `source: "api"` to get the API key in the response
- Returns `{ api_key, tier, message }`

### Polling Helper

**`waitForTerminal(receiptId, opts?)`**
- Polls `checkStatus` until `is_terminal` is true
- Uses server-provided `next_poll_after_seconds` for interval, falls back to 15s
- `maxAttempts` defaults to 20 (prevents infinite loops)
- `onPoll` callback fires after each poll with the current status
- Throws `ProofSlipError` with code `poll_timeout` if max attempts exceeded
- Throws `ProofSlipError` if the receipt is not found during polling

## Error Handling

```typescript
class ProofSlipError extends Error {
  code: string        // 'validation_error', 'unauthorized', 'not_found', etc.
  status: number      // HTTP status code (0 for network errors)
  requestId?: string  // present on 5xx errors
}
```

Error codes mirror the API:
- `validation_error` (400)
- `unauthorized` (401)
- `not_found` / `receipt_not_found` (404)
- `idempotency_conflict` (409)
- `rate_limited` (429)
- `internal_error` (500)
- `network_error` (fetch failure)
- `poll_timeout` (client-side, waitForTerminal exceeded maxAttempts)

## Types

All exported from the package root:

```typescript
type ReceiptType = 'action' | 'approval' | 'handshake' | 'resume' | 'failure'

interface CreateReceiptInput {
  type: ReceiptType
  status: string
  summary: string                    // max 280 chars
  payload?: Record<string, unknown>  // max 4KB
  ref?: {
    run_id?: string
    agent_id?: string
    action_id?: string
    workflow_id?: string
    session_id?: string
  }
  expires_in?: number                // 60-86400 seconds
  idempotency_key?: string
  audience?: 'human'
}

interface Receipt {
  receipt_id: string
  type: ReceiptType
  status: string
  summary: string
  verify_url: string
  created_at: string                 // ISO 8601
  expires_at: string                 // ISO 8601
  idempotency_key: string | null
  audience?: string
  is_terminal: boolean
  next_poll_after_seconds: number | null
}

interface VerifyResult {
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

interface StatusResult {
  receipt_id: string
  status: string
  is_terminal: boolean
  next_poll_after_seconds: number | null
  expires_at: string
}

interface SignupResult {
  api_key: string
  tier: string
  message: string
}
```

## Package Structure

```
packages/sdk/
├── src/
│   ├── index.ts        # re-exports client, types, error
│   ├── client.ts       # ProofSlipClient class
│   ├── types.ts        # all request/response interfaces
│   ├── errors.ts       # ProofSlipError class
│   └── polling.ts      # terminal detection + interval logic
├── package.json        # @proofslip/sdk
├── tsconfig.json
└── tsup.config.ts      # ESM + CJS dual build
```

### Build

- **Bundler:** tsup (ESM + CJS output)
- **Target:** ES2020 (broad Node.js + browser compat)
- **Dependencies:** None (uses global `fetch`)
- **Dev dependencies:** tsup, typescript

### package.json essentials

```json
{
  "name": "@proofslip/sdk",
  "version": "0.1.0",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

## MCP Server Refactor

After SDK is published:

1. Add `@proofslip/sdk` as dependency of `@proofslip/mcp-server`
2. Replace `packages/mcp-server/src/client.ts` with import from SDK
3. MCP tool handlers catch `ProofSlipError` and convert to MCP error responses
4. Remove duplicated types from MCP server
5. Bump MCP server to next minor version

## Testing

- Unit tests for `ProofSlipClient` with mocked fetch (same pattern as MCP server tests)
- Test error throwing for each error code
- Test `waitForTerminal` polling logic (mock sequential status responses)
- Tests live in `tests/packages/sdk/` following existing convention
