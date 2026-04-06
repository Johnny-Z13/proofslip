# @proofslip/sdk Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone JS/TS client library for the ProofSlip API that becomes the shared dependency for `@proofslip/mcp-server`.

**Architecture:** Thin fetch-based client with 4 core methods + 1 polling helper. Throws typed `ProofSlipError` on failures. Dual ESM/CJS build via tsup. Zero runtime dependencies.

**Tech Stack:** TypeScript, tsup (bundler), Vitest (tests)

---

## File Structure

```
packages/sdk/
├── src/
│   ├── index.ts        # re-exports everything
│   ├── client.ts       # ProofSlipClient class
│   ├── types.ts        # request/response interfaces
│   ├── errors.ts       # ProofSlipError class
│   └── polling.ts      # isTerminal() + getNextPollAfterSeconds()
├── package.json
├── tsconfig.json
└── tsup.config.ts
```

Tests live at the repo root: `tests/packages/sdk/`

---

### Task 1: Package scaffolding

**Files:**
- Create: `packages/sdk/package.json`
- Create: `packages/sdk/tsconfig.json`
- Create: `packages/sdk/tsup.config.ts`
- Create: `packages/sdk/src/index.ts` (placeholder)

- [ ] **Step 1: Create package.json**

```json
{
  "name": "@proofslip/sdk",
  "version": "0.1.0",
  "description": "TypeScript client for the ProofSlip receipt verification API",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      },
      "require": {
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      }
    }
  },
  "files": [
    "dist",
    "README.md"
  ],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.9.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "keywords": [
    "proofslip",
    "receipts",
    "ai-agents",
    "verification",
    "sdk"
  ],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Johnny-Z13/proofslip.git",
    "directory": "packages/sdk"
  },
  "homepage": "https://proofslip.ai",
  "bugs": {
    "url": "https://github.com/Johnny-Z13/proofslip/issues"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "declaration": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  target: 'es2022',
})
```

- [ ] **Step 4: Create placeholder index.ts**

```typescript
// @proofslip/sdk
export {}
```

- [ ] **Step 5: Install dependencies and verify build**

Run: `cd packages/sdk && npm install && npm run build`
Expected: Clean build, `dist/` created with `index.js`, `index.cjs`, `index.d.ts`

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/
git commit -m "chore: scaffold @proofslip/sdk package"
```

---

### Task 2: Types

**Files:**
- Create: `packages/sdk/src/types.ts`
- Modify: `packages/sdk/src/index.ts`

- [ ] **Step 1: Create types.ts**

```typescript
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
```

- [ ] **Step 2: Export types from index.ts**

Replace `packages/sdk/src/index.ts` with:

```typescript
export type {
  ReceiptType,
  CreateReceiptInput,
  Receipt,
  VerifyResult,
  StatusResult,
  SignupResult,
} from './types.js'
```

- [ ] **Step 3: Verify build**

Run: `cd packages/sdk && npm run build`
Expected: Clean build, types exported in `dist/index.d.ts`

- [ ] **Step 4: Commit**

```bash
git add packages/sdk/src/types.ts packages/sdk/src/index.ts
git commit -m "feat(sdk): add request/response type definitions"
```

---

### Task 3: Error class

**Files:**
- Create: `packages/sdk/src/errors.ts`
- Create: `tests/packages/sdk/errors.test.ts`
- Modify: `packages/sdk/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/packages/sdk/errors.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { ProofSlipError } from '../../../packages/sdk/src/errors.js'

describe('ProofSlipError', () => {
  it('is an instance of Error', () => {
    const err = new ProofSlipError('Not found', 'not_found', 404)
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ProofSlipError)
  })

  it('stores code, status, and message', () => {
    const err = new ProofSlipError('Invalid API key', 'unauthorized', 401)
    expect(err.message).toBe('Invalid API key')
    expect(err.code).toBe('unauthorized')
    expect(err.status).toBe(401)
  })

  it('stores optional requestId', () => {
    const err = new ProofSlipError('Server error', 'internal_error', 500, 'req_abc123')
    expect(err.requestId).toBe('req_abc123')
  })

  it('has undefined requestId by default', () => {
    const err = new ProofSlipError('Oops', 'internal_error', 500)
    expect(err.requestId).toBeUndefined()
  })

  it('has the name ProofSlipError', () => {
    const err = new ProofSlipError('test', 'test', 0)
    expect(err.name).toBe('ProofSlipError')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/packages/sdk/errors.test.ts`
Expected: FAIL — cannot resolve `../../../packages/sdk/src/errors.js`

- [ ] **Step 3: Write errors.ts**

Create `packages/sdk/src/errors.ts`:

```typescript
export class ProofSlipError extends Error {
  readonly code: string
  readonly status: number
  readonly requestId?: string

  constructor(message: string, code: string, status: number, requestId?: string) {
    super(message)
    this.name = 'ProofSlipError'
    this.code = code
    this.status = status
    this.requestId = requestId
  }
}
```

- [ ] **Step 4: Export from index.ts**

Add to `packages/sdk/src/index.ts`:

```typescript
export { ProofSlipError } from './errors.js'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/packages/sdk/errors.test.ts`
Expected: PASS — all 5 tests green

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/src/errors.ts packages/sdk/src/index.ts tests/packages/sdk/errors.test.ts
git commit -m "feat(sdk): add ProofSlipError class"
```

---

### Task 4: Polling utilities

**Files:**
- Create: `packages/sdk/src/polling.ts`
- Create: `tests/packages/sdk/polling.test.ts`
- Modify: `packages/sdk/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/packages/sdk/polling.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { isTerminal, getNextPollAfterSeconds } from '../../../packages/sdk/src/polling.js'

describe('isTerminal', () => {
  it('action type is always terminal', () => {
    expect(isTerminal('action', 'pending')).toBe(true)
    expect(isTerminal('action', 'success')).toBe(true)
  })

  it('failure type is always terminal', () => {
    expect(isTerminal('failure', 'pending')).toBe(true)
  })

  it('resume type is always terminal', () => {
    expect(isTerminal('resume', 'pending')).toBe(true)
  })

  it('approval with terminal status is terminal', () => {
    expect(isTerminal('approval', 'approved')).toBe(true)
    expect(isTerminal('approval', 'rejected')).toBe(true)
    expect(isTerminal('approval', 'denied')).toBe(true)
  })

  it('approval with non-terminal status is not terminal', () => {
    expect(isTerminal('approval', 'pending')).toBe(false)
    expect(isTerminal('approval', 'awaiting_review')).toBe(false)
  })

  it('handshake with terminal status is terminal', () => {
    expect(isTerminal('handshake', 'connected')).toBe(true)
    expect(isTerminal('handshake', 'disconnected')).toBe(true)
  })

  it('handshake with non-terminal status is not terminal', () => {
    expect(isTerminal('handshake', 'pending')).toBe(false)
    expect(isTerminal('handshake', 'negotiating')).toBe(false)
  })
})

describe('getNextPollAfterSeconds', () => {
  it('returns null for terminal states', () => {
    expect(getNextPollAfterSeconds('action', 'success')).toBeNull()
    expect(getNextPollAfterSeconds('failure', 'failed')).toBeNull()
    expect(getNextPollAfterSeconds('approval', 'approved')).toBeNull()
  })

  it('returns 30 for approval pending/awaiting_review', () => {
    expect(getNextPollAfterSeconds('approval', 'pending')).toBe(30)
    expect(getNextPollAfterSeconds('approval', 'awaiting_review')).toBe(30)
  })

  it('returns 15 for approval with other non-terminal status', () => {
    expect(getNextPollAfterSeconds('approval', 'in_progress')).toBe(15)
  })

  it('returns 10 for handshake pending/negotiating', () => {
    expect(getNextPollAfterSeconds('handshake', 'pending')).toBe(10)
    expect(getNextPollAfterSeconds('handshake', 'negotiating')).toBe(10)
  })

  it('returns 15 for handshake with other non-terminal status', () => {
    expect(getNextPollAfterSeconds('handshake', 'in_progress')).toBe(15)
  })

  it('returns 15 as default for unknown non-terminal', () => {
    expect(getNextPollAfterSeconds('handshake', 'custom_status')).toBe(15)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/packages/sdk/polling.test.ts`
Expected: FAIL — cannot resolve `../../../packages/sdk/src/polling.js`

- [ ] **Step 3: Write polling.ts**

Create `packages/sdk/src/polling.ts`:

```typescript
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
```

- [ ] **Step 4: Export from index.ts**

Add to `packages/sdk/src/index.ts`:

```typescript
export { isTerminal, getNextPollAfterSeconds } from './polling.js'
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/packages/sdk/polling.test.ts`
Expected: PASS — all tests green

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/src/polling.ts packages/sdk/src/index.ts tests/packages/sdk/polling.test.ts
git commit -m "feat(sdk): add polling utilities (isTerminal, getNextPollAfterSeconds)"
```

---

### Task 5: ProofSlipClient — core methods

**Files:**
- Create: `packages/sdk/src/client.ts`
- Create: `tests/packages/sdk/client.test.ts`
- Modify: `packages/sdk/src/index.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/packages/sdk/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Client will be imported after implementation
// import { ProofSlipClient, ProofSlipError } from '../../../packages/sdk/src/index.js'

const BASE_URL = 'https://proofslip.ai'
const API_KEY = 'ak_test1234567890'

function mockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('ProofSlipClient constructor', () => {
  it('accepts explicit apiKey and baseUrl', async () => {
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    await client.checkStatus('rct_test')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain(BASE_URL)
  })

  it('reads PROOFSLIP_API_KEY from env', async () => {
    vi.stubEnv('PROOFSLIP_API_KEY', API_KEY)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient()
    const fetch = mockFetch(201, { receipt_id: 'rct_123' })
    vi.stubGlobal('fetch', fetch)
    await client.createReceipt({ type: 'action', status: 'success', summary: 'test' })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe(`Bearer ${API_KEY}`)
  })

  it('defaults baseUrl to https://proofslip.ai', async () => {
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient()
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    await client.checkStatus('rct_test')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain('https://proofslip.ai')
  })
})

describe('ProofSlipClient.createReceipt', () => {
  it('returns typed Receipt on 201', async () => {
    const receiptData = {
      receipt_id: 'rct_abc',
      type: 'action',
      status: 'success',
      summary: 'deployed v2',
      verify_url: 'https://proofslip.ai/v1/verify/rct_abc',
      created_at: '2026-04-05T00:00:00Z',
      expires_at: '2026-04-06T00:00:00Z',
      idempotency_key: null,
      is_terminal: true,
      next_poll_after_seconds: null,
    }
    vi.stubGlobal('fetch', mockFetch(201, receiptData))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    const receipt = await client.createReceipt({ type: 'action', status: 'success', summary: 'deployed v2' })
    expect(receipt.receipt_id).toBe('rct_abc')
    expect(receipt.verify_url).toContain('rct_abc')
  })

  it('sends Authorization header', async () => {
    const fetch = mockFetch(201, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.createReceipt({ type: 'action', status: 'success', summary: 'x' })
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBe(`Bearer ${API_KEY}`)
  })

  it('throws ProofSlipError on 401', async () => {
    vi.stubGlobal('fetch', mockFetch(401, { error: 'unauthorized', message: 'Invalid API key' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: 'bad_key', baseUrl: BASE_URL })
    await expect(client.createReceipt({ type: 'action', status: 'x', summary: 'x' }))
      .rejects.toThrow(ProofSlipError)
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('unauthorized')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(401)
    }
  })

  it('throws ProofSlipError on 409 idempotency conflict', async () => {
    vi.stubGlobal('fetch', mockFetch(409, { error: 'idempotency_conflict', message: 'Duplicate key' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x', idempotency_key: 'dup' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('idempotency_conflict')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(409)
    }
  })

  it('throws ProofSlipError with requestId on 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, { error: 'internal_error', message: 'boom', request_id: 'req_xyz' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    try {
      await client.createReceipt({ type: 'action', status: 'x', summary: 'x' })
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).requestId).toBe('req_xyz')
    }
  })
})

describe('ProofSlipClient.verifyReceipt', () => {
  it('returns typed VerifyResult on 200', async () => {
    const data = {
      receipt_id: 'rct_abc',
      valid: true,
      type: 'action',
      status: 'success',
      summary: 'test',
      payload: null,
      ref: null,
      created_at: '2026-04-05T00:00:00Z',
      expires_at: '2026-04-06T00:00:00Z',
      expired: false,
      is_terminal: true,
      next_poll_after_seconds: null,
    }
    vi.stubGlobal('fetch', data ? mockFetch(200, data) : mockFetch(200, {}))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.verifyReceipt('rct_abc')
    expect(result.valid).toBe(true)
    expect(result.receipt_id).toBe('rct_abc')
  })

  it('does not send Authorization header', async () => {
    const fetch = mockFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.verifyReceipt('rct_abc')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })

  it('encodes receipt ID in URL', async () => {
    const fetch = mockFetch(200, { receipt_id: 'rct_abc' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.verifyReceipt('rct_has spaces&more')
    const [url] = fetch.mock.calls[0]
    expect(url).toContain(encodeURIComponent('rct_has spaces&more'))
  })

  it('throws ProofSlipError on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'not_found', message: 'Receipt not found' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await expect(client.verifyReceipt('rct_missing')).rejects.toThrow(ProofSlipError)
  })
})

describe('ProofSlipClient.checkStatus', () => {
  it('returns typed StatusResult on 200', async () => {
    const data = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 15,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', mockFetch(200, data))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.checkStatus('rct_abc')
    expect(result.status).toBe('pending')
    expect(result.is_terminal).toBe(false)
  })

  it('does not send Authorization header', async () => {
    const fetch = mockFetch(200, { status: 'ok' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
    await client.checkStatus('rct_abc')
    const [, init] = fetch.mock.calls[0]
    expect(init.headers['Authorization']).toBeUndefined()
  })
})

describe('ProofSlipClient.signup', () => {
  it('returns SignupResult on 201', async () => {
    const data = { api_key: 'ak_new_key', tier: 'free', message: 'Key created' }
    vi.stubGlobal('fetch', mockFetch(201, data))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.signup('user@example.com')
    expect(result.api_key).toBe('ak_new_key')
    expect(result.tier).toBe('free')
  })

  it('sends source: "api" in body', async () => {
    const fetch = mockFetch(201, { api_key: 'ak_x', tier: 'free', message: 'ok' })
    vi.stubGlobal('fetch', fetch)
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    await client.signup('user@example.com')
    const [, init] = fetch.mock.calls[0]
    const body = JSON.parse(init.body)
    expect(body.source).toBe('api')
    expect(body.email).toBe('user@example.com')
  })

  it('throws ProofSlipError on 409 email exists', async () => {
    vi.stubGlobal('fetch', mockFetch(409, { error: 'email_exists', message: 'Already registered' }))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.signup('existing@example.com')
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('email_exists')
    }
  })
})

describe('ProofSlipClient — network errors', () => {
  it('throws ProofSlipError with code network_error on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.verifyReceipt('rct_abc')
    } catch (err) {
      expect(err).toBeInstanceOf(ProofSlipError)
      expect((err as InstanceType<typeof ProofSlipError>).code).toBe('network_error')
      expect((err as InstanceType<typeof ProofSlipError>).status).toBe(0)
      expect((err as InstanceType<typeof ProofSlipError>).message).toBe('Connection refused')
    }
  })

  it('throws ProofSlipError with generic message for non-Error throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue('string error'))
    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    try {
      await client.verifyReceipt('rct_abc')
    } catch (err) {
      expect((err as InstanceType<typeof ProofSlipError>).message).toBe('Network error')
    }
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/packages/sdk/client.test.ts`
Expected: FAIL — cannot import ProofSlipClient

- [ ] **Step 3: Write client.ts**

Create `packages/sdk/src/client.ts`:

```typescript
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
```

- [ ] **Step 4: Export from index.ts**

Update `packages/sdk/src/index.ts` to its final form:

```typescript
export { ProofSlipClient } from './client.js'
export type { ProofSlipClientOptions } from './client.js'
export { ProofSlipError } from './errors.js'
export { isTerminal, getNextPollAfterSeconds } from './polling.js'
export type {
  ReceiptType,
  CreateReceiptInput,
  Receipt,
  VerifyResult,
  StatusResult,
  SignupResult,
} from './types.js'
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/packages/sdk/client.test.ts`
Expected: PASS — all tests green

- [ ] **Step 6: Commit**

```bash
git add packages/sdk/src/client.ts packages/sdk/src/index.ts tests/packages/sdk/client.test.ts
git commit -m "feat(sdk): add ProofSlipClient with create, verify, checkStatus, signup"
```

---

### Task 6: waitForTerminal polling helper

**Files:**
- Create: `tests/packages/sdk/wait-for-terminal.test.ts`
- Modify: `packages/sdk/src/client.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/packages/sdk/wait-for-terminal.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

const BASE_URL = 'https://proofslip.ai'
const API_KEY = 'ak_test1234567890'

beforeEach(() => {
  vi.restoreAllMocks()
  vi.useFakeTimers()
})

describe('ProofSlipClient.waitForTerminal', () => {
  it('returns immediately if first poll is terminal', async () => {
    const terminalStatus = {
      receipt_id: 'rct_abc',
      status: 'completed',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(terminalStatus),
    }))
    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const result = await client.waitForTerminal('rct_abc')
    expect(result.is_terminal).toBe(true)
    expect(result.status).toBe('completed')
  })

  it('polls until terminal and returns final status', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const done = {
      receipt_id: 'rct_abc',
      status: 'approved',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(done) })
    vi.stubGlobal('fetch', fetchMock)

    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    const promise = client.waitForTerminal('rct_abc')

    // Advance through the two poll delays
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    const result = await promise
    expect(result.status).toBe('approved')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('calls onPoll callback after each poll', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    const done = {
      receipt_id: 'rct_abc',
      status: 'approved',
      is_terminal: true,
      next_poll_after_seconds: null,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(pending) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: () => Promise.resolve(done) }))

    const { ProofSlipClient } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })
    const polls: string[] = []

    const promise = client.waitForTerminal('rct_abc', {
      onPoll: (s) => polls.push(s.status),
    })
    await vi.advanceTimersByTimeAsync(1000)
    await promise
    expect(polls).toEqual(['pending', 'approved'])
  })

  it('throws poll_timeout after maxAttempts', async () => {
    const pending = {
      receipt_id: 'rct_abc',
      status: 'pending',
      is_terminal: false,
      next_poll_after_seconds: 1,
      expires_at: '2026-04-06T00:00:00Z',
    }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, status: 200, json: () => Promise.resolve(pending),
    }))

    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    const promise = client.waitForTerminal('rct_abc', { maxAttempts: 3 })

    // Advance past 3 poll intervals
    await vi.advanceTimersByTimeAsync(1000)
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).rejects.toThrow(ProofSlipError)
    try { await promise } catch (err) {
      expect((err as any).code).toBe('poll_timeout')
    }
  })

  it('throws ProofSlipError if receipt not found during polling', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: 'not_found', message: 'Receipt not found' }),
    }))

    const { ProofSlipClient, ProofSlipError } = await import('../../../packages/sdk/src/index.js')
    const client = new ProofSlipClient({ baseUrl: BASE_URL })

    await expect(client.waitForTerminal('rct_missing')).rejects.toThrow(ProofSlipError)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/packages/sdk/wait-for-terminal.test.ts`
Expected: FAIL — `waitForTerminal` is not a function

- [ ] **Step 3: Add waitForTerminal to client.ts**

Add this method to the `ProofSlipClient` class in `packages/sdk/src/client.ts`, after the `signup` method:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/packages/sdk/wait-for-terminal.test.ts`
Expected: PASS — all 5 tests green

- [ ] **Step 5: Commit**

```bash
git add packages/sdk/src/client.ts tests/packages/sdk/wait-for-terminal.test.ts
git commit -m "feat(sdk): add waitForTerminal polling helper"
```

---

### Task 7: Build verification and full test run

**Files:** None new — verification only.

- [ ] **Step 1: Run full SDK build**

Run: `cd packages/sdk && npm run build`
Expected: Clean build, `dist/` contains `index.js`, `index.cjs`, `index.d.ts`, `index.d.cts`

- [ ] **Step 2: Run all SDK tests together**

Run: `npx vitest run tests/packages/sdk/`
Expected: All tests pass (errors, polling, client, wait-for-terminal)

- [ ] **Step 3: Verify type exports in dist**

Run: `grep "export" packages/sdk/dist/index.d.ts | head -20`
Expected: Should see exports for `ProofSlipClient`, `ProofSlipError`, `isTerminal`, `getNextPollAfterSeconds`, and all type interfaces

- [ ] **Step 4: Run existing MCP server tests to confirm no breakage**

Run: `npx vitest run tests/packages/mcp-server/`
Expected: PASS — MCP server tests still green (SDK hasn't replaced its client yet)

- [ ] **Step 5: Commit any fixes if needed**

Only if previous steps revealed issues.

---

### Task 8: Refactor MCP server to use SDK

**Files:**
- Modify: `packages/mcp-server/package.json`
- Delete: `packages/mcp-server/src/client.ts`
- Modify: `packages/mcp-server/src/index.ts`
- Modify: `packages/mcp-server/src/config.ts`
- Modify: `packages/mcp-server/src/tools/create-receipt.ts`
- Modify: `packages/mcp-server/src/tools/verify-receipt.ts`
- Modify: `packages/mcp-server/src/tools/check-status.ts`
- Modify: `packages/mcp-server/src/tools/signup.ts`
- Modify: `tests/packages/mcp-server/client.test.ts`

- [ ] **Step 1: Link SDK locally for development**

Run: `cd packages/sdk && npm link && cd ../mcp-server && npm link @proofslip/sdk`

This makes `@proofslip/sdk` available to the MCP server during development without publishing.

- [ ] **Step 2: Add SDK as dependency in MCP server package.json**

In `packages/mcp-server/package.json`, add to `dependencies`:

```json
"@proofslip/sdk": "^0.1.0"
```

- [ ] **Step 3: Update all tool imports**

In each tool file (`packages/mcp-server/src/tools/create-receipt.ts`, `verify-receipt.ts`, `check-status.ts`, `signup.ts`), change:

```typescript
// Before
import type { ProofSlipClient } from '../client.js';

// After
import type { ProofSlipClient } from '@proofslip/sdk';
```

- [ ] **Step 4: Update index.ts import**

In `packages/mcp-server/src/index.ts`, change:

```typescript
// Before
import { ProofSlipClient } from './client.js';

// After
import { ProofSlipClient } from '@proofslip/sdk';
```

- [ ] **Step 5: Update config.ts**

In `packages/mcp-server/src/config.ts`, no changes needed — config is MCP-server specific and stays.

- [ ] **Step 6: Update tool handlers to catch ProofSlipError**

In `packages/mcp-server/src/tools/create-receipt.ts`, update the error handling. Change the handler from using `result.ok` to try/catch:

```typescript
import { ProofSlipError } from '@proofslip/sdk';

// In the tool handler:
    async (params) => {
      if (!client.hasApiKey()) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'No API key configured. Set the PROOFSLIP_API_KEY environment variable, or use the signup tool to get a free key.',
            },
          ],
        };
      }
      try {
        const receipt = await client.createReceipt(params);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(receipt, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof ProofSlipError
          ? `Error (${err.status}): ${err.message}`
          : `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        return {
          isError: true,
          content: [{ type: 'text' as const, text: message }],
        };
      }
    },
```

Apply the same try/catch pattern to `verify-receipt.ts`, `check-status.ts`, and `signup.ts` (these don't need the `hasApiKey` guard — just try/catch around the SDK call).

- [ ] **Step 7: Handle hasApiKey**

The SDK's `ProofSlipClient` doesn't expose `hasApiKey()` — the MCP server's `create-receipt` tool needs it. Two options:

Add a `hasApiKey()` method to the SDK client in `packages/sdk/src/client.ts`:

```typescript
  hasApiKey(): boolean {
    return !!this.apiKey
  }
```

And export it — this is a reasonable SDK feature (lets consumers check config before making auth-required calls).

- [ ] **Step 8: Delete old client.ts from MCP server**

Delete `packages/mcp-server/src/client.ts` — the SDK replaces it entirely.

- [ ] **Step 9: Update MCP server constructor in index.ts**

The MCP server currently passes `(baseUrl, apiKey)` positionally. The SDK uses an options object. Update `packages/mcp-server/src/index.ts`:

```typescript
// Before
const client = new ProofSlipClient(config.baseUrl, config.apiKey);

// After
const client = new ProofSlipClient({ baseUrl: config.baseUrl, apiKey: config.apiKey });
```

- [ ] **Step 10: Update MCP server tests**

In `tests/packages/mcp-server/client.test.ts`, update imports and constructor calls:

```typescript
// Before
import { ProofSlipClient } from '../../../packages/mcp-server/src/client.js'
const client = new ProofSlipClient(BASE_URL, API_KEY)

// After
import { ProofSlipClient } from '@proofslip/sdk'
const client = new ProofSlipClient({ apiKey: API_KEY, baseUrl: BASE_URL })
```

Also update test expectations: the SDK throws instead of returning `{ ok: false }`. Error tests need to use `expect(...).rejects.toThrow()` instead of checking `result.ok`.

- [ ] **Step 11: Run MCP server tests**

Run: `npx vitest run tests/packages/mcp-server/`
Expected: PASS — all tests green with new SDK-based client

- [ ] **Step 12: Run full test suite**

Run: `npx vitest run tests/packages/`
Expected: PASS — both SDK and MCP server tests green

- [ ] **Step 13: Commit**

```bash
git add packages/mcp-server/ packages/sdk/src/client.ts tests/packages/mcp-server/
git commit -m "refactor(mcp-server): replace internal client with @proofslip/sdk"
```

---

### Task 9: Update test:all orchestrator and playbook

**Files:**
- Modify: `scripts/test-all.ts` (if SDK tests need to be added to the orchestrator)
- Modify: `docs/growth/playbook.md`
- Modify: `docs/growth/log.md`

- [ ] **Step 1: Check if test:packages already covers SDK tests**

Run: `npx vitest run tests/packages/`
Expected: Should now run both `tests/packages/sdk/` and `tests/packages/mcp-server/`

If `test:packages` already picks up SDK tests (it should — vitest runs everything under the path), no orchestrator changes needed.

- [ ] **Step 2: Update playbook — mark SDK as DONE**

In `docs/growth/playbook.md`, Phase 2 table, update the SDK row:

```markdown
| `@proofslip/sdk` — JS/TS client library | DONE | v0.1.0 — shared client, used by MCP server |
```

- [ ] **Step 3: Update growth log**

Add to `docs/growth/log.md` under the current date:

```markdown
- Built `@proofslip/sdk` v0.1.0 — JS/TS client (4 methods + waitForTerminal polling helper)
- Refactored `@proofslip/mcp-server` to use SDK as shared dependency
```

- [ ] **Step 4: Commit**

```bash
git add scripts/test-all.ts docs/growth/playbook.md docs/growth/log.md
git commit -m "chore: update playbook and test orchestrator for SDK"
```
