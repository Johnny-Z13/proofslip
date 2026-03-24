# Integration Tests + Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add integration tests simulating real agent workflows and a landing page at `GET /`

**Architecture:** Tests use Hono's in-process `app.request()` against the live Neon DB. Landing page is a server-rendered HTML template following the same pattern as the existing verify page views.

**Tech Stack:** Vitest, Hono test client, Drizzle ORM, Neon Postgres

---

## File Structure

**New files:**
- `tests/setup.ts` — shared test setup: dotenv, seed a test API key, cleanup
- `tests/routes/agent-workflows.test.ts` — pretend agent integration tests
- `tests/routes/verify-content-negotiation.test.ts` — HTML vs JSON response tests
- `src/views/landing-page.ts` — landing page HTML template

**Modified files:**
- `src/index.ts` — add `GET /` route for landing page
- `vitest.config.ts` — add setupFiles for dotenv loading

---

### Task 1: Test Setup Infrastructure

**Files:**
- Create: `tests/setup.ts`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Add dotenv loading to vitest config**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
  },
})
```

- [ ] **Step 2: Create test setup file**

```ts
// tests/setup.ts
import 'dotenv/config'
```

- [ ] **Step 3: Run existing tests to verify nothing broke**

Run: `npx vitest run`
Expected: All 3 existing test files pass

- [ ] **Step 4: Commit**

```bash
git add vitest.config.ts tests/setup.ts
git commit -m "test: add dotenv setup for integration tests"
```

---

### Task 2: Test Helper — Seed API Key for Tests

**Files:**
- Create: `tests/helpers.ts`

- [ ] **Step 1: Create test helper with API key seeding**

```ts
// tests/helpers.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { apiKeys, receipts } from '../src/db/schema.js'
import { generateApiKey, generateApiKeyId, getKeyPrefix } from '../src/lib/ids.js'
import { sha256 } from '../src/lib/hash.js'
import { eq } from 'drizzle-orm'

export function getTestDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql)
}

export async function seedTestApiKey() {
  const db = getTestDb()
  const key = generateApiKey()
  const keyId = generateApiKeyId()

  await db.insert(apiKeys).values({
    id: keyId,
    keyPrefix: getKeyPrefix(key),
    keyHash: sha256(key),
    ownerEmail: 'test@proofslip.ai',
    tier: 'free',
    usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  return { key, keyId }
}

export async function cleanupTestApiKey(keyId: string) {
  const db = getTestDb()
  await db.delete(receipts).where(eq(receipts.apiKeyId, keyId))
  await db.delete(apiKeys).where(eq(apiKeys.id, keyId))
}
```

- [ ] **Step 2: Commit**

```bash
git add tests/helpers.ts
git commit -m "test: add helpers for seeding and cleaning up test API keys"
```

---

### Task 3: Agent Workflow Integration Tests

**Files:**
- Create: `tests/routes/agent-workflows.test.ts`

- [ ] **Step 1: Write the full test file**

```ts
// tests/routes/agent-workflows.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

function post(path: string, body: object, key?: string) {
  return app.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key !== undefined ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(body),
  })
}

function get(path: string, headers?: Record<string, string>) {
  return app.request(path, { headers })
}

// ─── 1. Refund Bot: action + idempotency ────────────────────────

describe('Refund Bot — action receipt with safe retry', () => {
  let receiptId: string

  it('creates an action receipt', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'success',
      summary: 'Refund of $42.00 issued to customer #8812',
      payload: { amount: 42, currency: 'USD', customer_id: '8812' },
      ref: { run_id: 'run_test_001', agent_id: 'refund-bot' },
      idempotency_key: 'test-refund-001',
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.receipt_id).toMatch(/^rct_/)
    expect(body.type).toBe('action')
    expect(body.status).toBe('success')
    expect(body.verify_url).toContain(body.receipt_id)
    receiptId = body.receipt_id
  })

  it('verifies the receipt as JSON', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.type).toBe('action')
    expect(body.payload).toEqual({ amount: 42, currency: 'USD', customer_id: '8812' })
  })

  it('retries with same idempotency key — gets same receipt back', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'success',
      summary: 'Refund of $42.00 issued to customer #8812',
      payload: { amount: 42, currency: 'USD', customer_id: '8812' },
      ref: { run_id: 'run_test_001', agent_id: 'refund-bot' },
      idempotency_key: 'test-refund-001',
    }, apiKey)

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.receipt_id).toBe(receiptId)
  })
})

// ─── 2. Approval Poller ─────────────────────────────────────────

describe('Approval Poller — pending receipt with polling', () => {
  let receiptId: string

  it('creates a pending approval receipt', async () => {
    const res = await post('/v1/receipts', {
      type: 'approval',
      status: 'pending',
      summary: 'Deploy to prod requires ops approval',
      payload: { requester: 'deploy-bot', environment: 'production' },
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.type).toBe('approval')
    expect(body.status).toBe('pending')
    receiptId = body.receipt_id
  })

  it('polls the receipt — still pending', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
    expect(body.status).toBe('pending')
    expect(body.payload).toEqual({ requester: 'deploy-bot', environment: 'production' })
  })
})

// ─── 3. Handshake Agent ─────────────────────────────────────────

describe('Handshake Agent — scope verification', () => {
  let receiptId: string

  it('creates a handshake receipt with scopes', async () => {
    const res = await post('/v1/receipts', {
      type: 'handshake',
      status: 'connected',
      summary: 'CRM tool connected with read-only access',
      payload: { tool: 'salesforce', read: true, write: false, scopes: ['contacts.read'] },
      ref: { agent_id: 'crm-agent', session_id: 'sess_abc' },
    }, apiKey)

    expect(res.status).toBe(201)
    receiptId = (await res.json()).receipt_id
  })

  it('verifies scopes in payload before proceeding', async () => {
    const res = await get(`/v1/verify/${receiptId}?format=json`)
    const body = await res.json()
    expect(body.payload.write).toBe(false)
    expect(body.payload.scopes).toContain('contacts.read')
  })
})

// ─── 4. Expired Receipt ─────────────────────────────────────────

describe('Expired Receipt — TTL enforcement', () => {
  it('creates a receipt with minimum TTL', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
      status: 'done',
      summary: 'Short-lived receipt for TTL test',
      expires_in: 60,
    }, apiKey)

    expect(res.status).toBe(201)
    const body = await res.json()
    // Verify expires_at is ~60 seconds from now
    const expiresAt = new Date(body.expires_at)
    const diff = expiresAt.getTime() - Date.now()
    expect(diff).toBeLessThan(65000)
    expect(diff).toBeGreaterThan(50000)
  })

  it('returns 404 for a nonexistent receipt', async () => {
    const res = await get('/v1/verify/rct_doesnotexist123456?format=json')
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body.error).toBe('receipt_not_found')
  })
})

// ─── 5. Bad Actor — error cases ─────────────────────────────────

describe('Bad Actor — auth and validation errors', () => {
  it('rejects missing auth header', async () => {
    const res = await app.request('/v1/receipts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'action', status: 'ok', summary: 'test' }),
    })
    expect(res.status).toBe(401)
  })

  it('rejects invalid API key format', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'test',
    }, 'not-a-valid-key')
    expect(res.status).toBe(401)
  })

  it('rejects valid format but wrong key', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'test',
    }, 'ak_0000000000000000000000000000000000000000000000000000000000000000')
    expect(res.status).toBe(401)
  })

  it('rejects invalid receipt type', async () => {
    const res = await post('/v1/receipts', {
      type: 'bogus', status: 'ok', summary: 'test',
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('rejects missing required fields', async () => {
    const res = await post('/v1/receipts', {
      type: 'action',
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('rejects summary over 280 chars', async () => {
    const res = await post('/v1/receipts', {
      type: 'action', status: 'ok', summary: 'x'.repeat(281),
    }, apiKey)
    expect(res.status).toBe(400)
  })

  it('returns 409 on idempotency conflict', async () => {
    // First request
    await post('/v1/receipts', {
      type: 'action', status: 'success', summary: 'original',
      idempotency_key: 'conflict-test-key',
    }, apiKey)

    // Second request with same key but different content
    const res = await post('/v1/receipts', {
      type: 'failure', status: 'error', summary: 'different content',
      idempotency_key: 'conflict-test-key',
    }, apiKey)
    expect(res.status).toBe(409)
  })
})
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run tests/routes/agent-workflows.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/routes/agent-workflows.test.ts
git commit -m "test: add agent workflow integration tests"
```

---

### Task 4: Content Negotiation Tests

**Files:**
- Create: `tests/routes/verify-content-negotiation.test.ts`

- [ ] **Step 1: Write the test file**

```ts
// tests/routes/verify-content-negotiation.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import app from '../../src/index.js'
import { seedTestApiKey, cleanupTestApiKey } from '../helpers.js'

let apiKey: string
let apiKeyId: string
let receiptId: string

beforeAll(async () => {
  const result = await seedTestApiKey()
  apiKey = result.key
  apiKeyId = result.keyId

  // Create a receipt to verify
  const res = await app.request('/v1/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      type: 'action',
      status: 'success',
      summary: 'Content negotiation test receipt',
    }),
  })
  receiptId = (await res.json()).receipt_id
})

afterAll(async () => {
  await cleanupTestApiKey(apiKeyId)
})

describe('Verify content negotiation', () => {
  it('returns JSON when Accept: application/json', async () => {
    const res = await app.request(`/v1/verify/${receiptId}`, {
      headers: { Accept: 'application/json' },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('application/json')
    const body = await res.json()
    expect(body.valid).toBe(true)
  })

  it('returns JSON when ?format=json', async () => {
    const res = await app.request(`/v1/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.valid).toBe(true)
  })

  it('returns HTML when Accept: text/html', async () => {
    const res = await app.request(`/v1/verify/${receiptId}`, {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Departure Mono')
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Verified')
  })

  it('returns HTML 404 page for missing receipt', async () => {
    const res = await app.request('/v1/verify/rct_nonexistent12345678', {
      headers: { Accept: 'text/html' },
    })
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain('Expired / Not Found')
  })

  it('works via /verify shortcut route too', async () => {
    const res = await app.request(`/verify/${receiptId}?format=json`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.receipt_id).toBe(receiptId)
  })
})
```

- [ ] **Step 2: Run the tests**

Run: `npx vitest run tests/routes/verify-content-negotiation.test.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/routes/verify-content-negotiation.test.ts
git commit -m "test: add verify content negotiation tests"
```

---

### Task 5: Landing Page Template

**Files:**
- Create: `src/views/landing-page.ts`

- [ ] **Step 1: Create the landing page view**

The HTML is the approved v6 design from the brainstorm session. Dark background, receipt hero, Departure Mono font, 16px base size. Full HTML template as a single exported function `renderLandingPage()`.

- [ ] **Step 2: Commit**

```bash
git add src/views/landing-page.ts
git commit -m "feat: add landing page template"
```

---

### Task 6: Wire Landing Page Route

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add the GET / route**

```ts
// src/index.ts
import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'
import { renderLandingPage } from './views/landing-page.js'

const app = new Hono()

app.get('/', (c) => c.html(renderLandingPage()))
app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)

export default app
```

- [ ] **Step 2: Verify it works locally**

Run: `curl -s http://localhost:3000/ | head -5`
Expected: HTML output starting with `<!DOCTYPE html>`

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire landing page to GET /"
```

---

### Task 7: Landing Page Test

**Files:**
- Create: `tests/routes/landing.test.ts`

- [ ] **Step 1: Write landing page test**

```ts
// tests/routes/landing.test.ts
import { describe, it, expect } from 'vitest'
import app from '../../src/index.js'

describe('Landing page', () => {
  it('serves HTML at GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('ProofSlip')
    expect(html).toContain('Departure Mono')
    expect(html).toContain('24-hour receipts')
    expect(html).toContain('Get your API key')
  })
})
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All test files pass

- [ ] **Step 3: Commit**

```bash
git add tests/routes/landing.test.ts
git commit -m "test: add landing page test"
```

---

### Task 8: Run Full Test Suite + Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass across all files

- [ ] **Step 2: Verify dev server serves landing page**

Run: `curl -s http://localhost:3000/ | grep "ProofSlip"`
Expected: Output containing ProofSlip

- [ ] **Step 3: Final commit if any cleanup needed**
