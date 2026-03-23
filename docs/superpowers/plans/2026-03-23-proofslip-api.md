# ProofSlip API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-endpoint API that lets agents create ephemeral verification receipts and lets anyone verify them via a public URL. Deploy to Vercel with Neon Postgres.

**Architecture:** Hono web framework on Vercel serverless functions. Neon serverless Postgres for storage with Drizzle ORM. Content-negotiated verify endpoint serves JSON to agents and HTML to browsers. Single deploy — API, landing page, and verify page all in one Hono app.

**Tech Stack:** TypeScript, Hono, Drizzle ORM, Neon Postgres, Vercel, nanoid

**Spec:** `docs/superpowers/specs/2026-03-23-proofslip-api-design.md`

---

## Phases

### Phase 1 — Ship it (Tasks 1-6)
Two endpoints, verify page with viral CTA, manually seeded API keys, deployed to Vercel. No signup flow, no landing page, no rate limiting, no Stripe. Goal: get receipts created and verify URLs circulating.

### Phase 2 — If traction (build only after usage signal)
- Self-serve signup endpoint (`POST /v1/auth/signup`)
- Rate limiting (hono-rate-limiter)
- Landing page with signup form
- TTL cron cleanup (daily Vercel cron)
- Magic-link login + key rotation
- Stripe integration
- Usage tracking + overage billing

---

## File Structure (Phase 1)

```
proofslip/
├── api/
│   └── index.ts                  # Vercel serverless entry point
├── src/
│   ├── index.ts                  # Hono app definition, route registration
│   ├── dev.ts                    # Local dev server (not deployed)
│   ├── db/
│   │   ├── schema.ts             # Drizzle table definitions (receipts, api_keys)
│   │   ├── client.ts             # Neon connection + Drizzle instance
│   │   ├── migrate.ts            # Migration runner script
│   │   └── seed.ts               # Seed script to create test API keys
│   ├── routes/
│   │   ├── receipts.ts           # POST /v1/receipts
│   │   └── verify.ts             # GET /v1/verify/:id and GET /verify/:id
│   ├── middleware/
│   │   └── api-key-auth.ts       # Bearer token validation middleware
│   ├── lib/
│   │   ├── ids.ts                # nanoid generation (rct_, ak_ prefixes)
│   │   ├── hash.ts               # SHA-256 hashing for API keys
│   │   ├── errors.ts             # Error envelope helper
│   │   └── validate.ts           # Request body validation
│   └── views/
│       ├── verify-page.ts        # HTML template for verify page
│       └── not-found-page.ts     # HTML template for expired/missing receipt
├── tests/
│   └── lib/
│       ├── ids.test.ts           # ID generation tests
│       ├── hash.test.ts          # Hashing tests
│       └── validate.test.ts      # Validation tests
├── drizzle/
│   └── migrations/               # Generated SQL migration files
├── drizzle.config.ts
├── vitest.config.ts
├── package.json
├── tsconfig.json
├── vercel.json
├── .env.example
└── .gitignore
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vercel.json`, `vitest.config.ts`, `.env.example`, `.gitignore`, `src/index.ts`, `src/dev.ts`, `api/index.ts`

- [ ] **Step 1: Initialize project**

```bash
cd D:/Projects/proofslip
npm init -y
```

- [ ] **Step 2: Install dependencies**

```bash
npm install hono @hono/node-server nanoid drizzle-orm @neondatabase/serverless
npm install -D typescript @types/node drizzle-kit vitest tsx dotenv
```

- [ ] **Step 3: Create tsconfig.json**

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
    "types": ["node"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Create .env.example**

```
DATABASE_URL=postgres://user:pass@ep-xyz.us-east-2.aws.neon.tech/dbname?sslmode=require
BASE_URL=http://localhost:3000
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.env
.vercel/
```

- [ ] **Step 6: Create src/index.ts (Hono app)**

```typescript
import { Hono } from 'hono'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))

export default app
```

- [ ] **Step 7: Create api/index.ts (Vercel entry point)**

```typescript
import { handle } from 'hono/vercel'
import app from '../src/index.js'

export default handle(app)
```

- [ ] **Step 8: Create vercel.json**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/api" }
  ]
}
```

- [ ] **Step 9: Create src/dev.ts (local dev server)**

```typescript
import { serve } from '@hono/node-server'
import app from './index.js'

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running at http://localhost:${info.port}`)
})
```

- [ ] **Step 10: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
  },
})
```

- [ ] **Step 11: Add scripts to package.json**

Add to `package.json`:
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/dev.ts",
    "test": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "tsx src/db/migrate.ts",
    "db:seed": "tsx src/db/seed.ts"
  }
}
```

- [ ] **Step 12: Verify local dev server starts**

Run: `npm run dev`
Expected: Server starts on port 3000, `curl http://localhost:3000/health` returns `{"status":"ok"}`

- [ ] **Step 13: Commit**

```bash
git init
git add package.json tsconfig.json vercel.json vitest.config.ts .env.example .gitignore src/ api/
git commit -m "feat: scaffold Hono project with Vercel deployment config"
```

---

## Task 2: Database Schema, Helpers, and Seed Script

**Files:**
- Create: `src/db/schema.ts`, `src/db/client.ts`, `src/db/migrate.ts`, `src/db/seed.ts`, `drizzle.config.ts`, `src/lib/ids.ts`, `src/lib/hash.ts`
- Test: `tests/lib/ids.test.ts`, `tests/lib/hash.test.ts`

- [ ] **Step 1: Create src/lib/ids.ts**

```typescript
import { nanoid } from 'nanoid'

export function generateReceiptId(): string {
  return `rct_${nanoid(21)}`
}

export function generateApiKeyId(): string {
  return `key_${nanoid(21)}`
}

export function generateApiKey(): string {
  const hex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `ak_${hex}`
}

export function getKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 11) // "ak_" + first 8 hex chars
}
```

- [ ] **Step 2: Write tests for ID generation**

```typescript
// tests/lib/ids.test.ts
import { describe, it, expect } from 'vitest'
import { generateReceiptId, generateApiKeyId, generateApiKey, getKeyPrefix } from '../../src/lib/ids.js'

describe('generateReceiptId', () => {
  it('starts with rct_ prefix', () => {
    expect(generateReceiptId()).toMatch(/^rct_/)
  })
  it('is 25 chars total (4 prefix + 21 nanoid)', () => {
    expect(generateReceiptId()).toHaveLength(25)
  })
  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateReceiptId()))
    expect(ids.size).toBe(100)
  })
})

describe('generateApiKey', () => {
  it('starts with ak_ prefix', () => {
    expect(generateApiKey()).toMatch(/^ak_/)
  })
  it('is 67 chars total (3 prefix + 64 hex)', () => {
    expect(generateApiKey()).toHaveLength(67)
  })
})

describe('getKeyPrefix', () => {
  it('returns first 11 chars (ak_ + 8 hex)', () => {
    const key = 'ak_abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    expect(getKeyPrefix(key)).toBe('ak_abcdef12')
  })
})
```

- [ ] **Step 3: Run tests**

Run: `npx vitest run tests/lib/ids.test.ts`
Expected: All pass

- [ ] **Step 4: Create src/lib/hash.ts**

```typescript
import { createHash } from 'node:crypto'

export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}
```

- [ ] **Step 5: Write tests for hashing**

```typescript
// tests/lib/hash.test.ts
import { describe, it, expect } from 'vitest'
import { sha256 } from '../../src/lib/hash.js'

describe('sha256', () => {
  it('returns consistent hash for same input', () => {
    expect(sha256('test')).toBe(sha256('test'))
  })
  it('returns different hash for different input', () => {
    expect(sha256('a')).not.toBe(sha256('b'))
  })
  it('returns 64-char hex string', () => {
    expect(sha256('test')).toHaveLength(64)
    expect(sha256('test')).toMatch(/^[0-9a-f]+$/)
  })
})
```

- [ ] **Step 6: Run tests**

Run: `npx vitest run tests/lib/hash.test.ts`
Expected: All pass

- [ ] **Step 7: Create src/db/schema.ts**

```typescript
import { pgTable, text, integer, jsonb, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core'

export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  apiKeyId: text('api_key_id').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  summary: text('summary').notNull(),
  payload: jsonb('payload'),
  ref: jsonb('ref'),
  idempotencyKey: text('idempotency_key'), // NULLable; Postgres UNIQUE allows multiple NULLs
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, (table) => [
  uniqueIndex('idx_receipts_idempotency').on(table.apiKeyId, table.idempotencyKey),
  index('idx_receipts_expires_at').on(table.expiresAt),
  index('idx_receipts_api_key_id').on(table.apiKeyId),
])

export const apiKeys = pgTable('api_keys', {
  id: text('id').primaryKey(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull().unique(),
  ownerEmail: text('owner_email').notNull(),
  tier: text('tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  usageCount: integer('usage_count').default(0),
  usageResetAt: timestamp('usage_reset_at', { withTimezone: true }),
}, (table) => [
  index('idx_api_keys_prefix').on(table.keyPrefix),
])
```

- [ ] **Step 8: Create src/db/client.ts**

```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema.js'

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle(sql, { schema })
}
```

- [ ] **Step 9: Create drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 10: Create src/db/migrate.ts**

```typescript
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { migrate } from 'drizzle-orm/neon-http/migrator'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function main() {
  console.log('Running migrations...')
  await migrate(db, { migrationsFolder: './drizzle/migrations' })
  console.log('Migrations complete.')
}

main().catch(console.error)
```

- [ ] **Step 11: Create src/db/seed.ts (seed API keys manually)**

This replaces a self-serve signup flow for Phase 1. Run this to create API keys for yourself and early testers.

```typescript
import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { apiKeys } from './schema.js'
import { generateApiKey, generateApiKeyId, getKeyPrefix } from '../lib/ids.js'
import { sha256 } from '../lib/hash.js'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: npm run db:seed -- user@example.com')
    process.exit(1)
  }

  const key = generateApiKey()
  const keyId = generateApiKeyId()

  await db.insert(apiKeys).values({
    id: keyId,
    keyPrefix: getKeyPrefix(key),
    keyHash: sha256(key),
    ownerEmail: email,
    tier: 'free',
    usageResetAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  })

  console.log(`\nAPI key created for ${email}:`)
  console.log(`\n  ${key}\n`)
  console.log('Save this key now. It cannot be retrieved later.\n')
}

seed().catch(console.error)
```

- [ ] **Step 12: Set up Neon database and run migration**

1. Create a Neon project at https://console.neon.tech
2. Copy the connection string to `.env` as `DATABASE_URL`
3. Run: `npx drizzle-kit generate`
4. Run: `npm run db:migrate`
5. Run: `npm run db:seed -- your@email.com` — save the API key it outputs

- [ ] **Step 13: Commit**

```bash
git add src/lib/ src/db/ drizzle.config.ts drizzle/ tests/
git commit -m "feat: add database schema, seed script, ID generation, and hashing"
```

---

## Task 3: Request Validation and Error Helpers

**Files:**
- Create: `src/lib/validate.ts`, `src/lib/errors.ts`
- Test: `tests/lib/validate.test.ts`

- [ ] **Step 1: Create src/lib/errors.ts**

```typescript
import { Context } from 'hono'

export function errorResponse(c: Context, status: number, error: string, message: string) {
  return c.json({ error, message }, status as any)
}
```

- [ ] **Step 2: Create src/lib/validate.ts**

```typescript
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
```

- [ ] **Step 3: Write validation tests**

```typescript
// tests/lib/validate.test.ts
import { describe, it, expect } from 'vitest'
import { validateCreateReceipt, isValidationError } from '../../src/lib/validate.js'

describe('validateCreateReceipt', () => {
  const validBody = { type: 'action', status: 'success', summary: 'Test receipt' }

  it('accepts valid minimal body', () => {
    expect(isValidationError(validateCreateReceipt(validBody))).toBe(false)
  })

  it('rejects missing type', () => {
    const r = validateCreateReceipt({ status: 'ok', summary: 'test' })
    expect(isValidationError(r)).toBe(true)
  })

  it('rejects invalid type', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, type: 'invalid' }))).toBe(true)
  })

  it('rejects missing summary', () => {
    expect(isValidationError(validateCreateReceipt({ type: 'action', status: 'ok' }))).toBe(true)
  })

  it('rejects summary over 280 chars', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, summary: 'a'.repeat(281) }))).toBe(true)
  })

  it('rejects payload over 4KB', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, payload: { data: 'x'.repeat(5000) } }))).toBe(true)
  })

  it('rejects non-object ref', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, ref: 'hello' }))).toBe(true)
  })

  it('rejects expires_in under 60', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, expires_in: 30 }))).toBe(true)
  })

  it('rejects expires_in over 86400', () => {
    expect(isValidationError(validateCreateReceipt({ ...validBody, expires_in: 100000 }))).toBe(true)
  })

  it('accepts full body with all optional fields', () => {
    const result = validateCreateReceipt({
      ...validBody,
      payload: { amount: 42 },
      ref: { run_id: 'run_123', agent_id: 'bot-1' },
      expires_in: 3600,
      idempotency_key: 'idem-123',
    })
    expect(isValidationError(result)).toBe(false)
  })
})
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run tests/lib/validate.test.ts`
Expected: All pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/errors.ts src/lib/validate.ts tests/lib/validate.test.ts
git commit -m "feat: add request validation and error response helpers"
```

---

## Task 4: API Key Auth Middleware

**Files:**
- Create: `src/middleware/api-key-auth.ts`

- [ ] **Step 1: Create src/middleware/api-key-auth.ts**

```typescript
import { createMiddleware } from 'hono/factory'
import { getDb } from '../db/client.js'
import { apiKeys } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { sha256 } from '../lib/hash.js'
import { getKeyPrefix } from '../lib/ids.js'
import { errorResponse } from '../lib/errors.js'

export const apiKeyAuth = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(c, 401, 'unauthorized', 'Missing or invalid Authorization header. Use: Bearer {api_key}')
  }

  const key = authHeader.slice(7)
  if (!key.startsWith('ak_') || key.length !== 67) {
    return errorResponse(c, 401, 'unauthorized', 'Invalid API key format.')
  }

  const prefix = getKeyPrefix(key)
  const hash = sha256(key)

  const db = getDb()
  const candidates = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyPrefix, prefix))

  const matched = candidates.find((k) => k.keyHash === hash)
  if (!matched) {
    return errorResponse(c, 401, 'unauthorized', 'Invalid API key.')
  }

  c.set('apiKeyRecord', matched)
  await next()
})
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware/api-key-auth.ts
git commit -m "feat: add API key authentication middleware"
```

---

## Task 5: Create Receipt Endpoint

**Files:**
- Create: `src/routes/receipts.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Create src/routes/receipts.ts**

```typescript
import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts, apiKeys } from '../db/schema.js'
import { eq, and, sql } from 'drizzle-orm'
import { generateReceiptId } from '../lib/ids.js'
import { validateCreateReceipt, isValidationError } from '../lib/validate.js'
import { errorResponse } from '../lib/errors.js'
import { apiKeyAuth } from '../middleware/api-key-auth.js'

const receiptsRouter = new Hono()

receiptsRouter.use('*', apiKeyAuth)

receiptsRouter.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  const validated = validateCreateReceipt(body)

  if (isValidationError(validated)) {
    return errorResponse(c, 400, validated.error, validated.message)
  }

  const apiKeyRecord = c.get('apiKeyRecord') as { id: string }
  const db = getDb()

  // Idempotency check
  if (validated.idempotency_key) {
    const existing = await db
      .select()
      .from(receipts)
      .where(
        and(
          eq(receipts.apiKeyId, apiKeyRecord.id),
          eq(receipts.idempotencyKey, validated.idempotency_key)
        )
      )

    if (existing.length > 0) {
      const receipt = existing[0]

      // Detect conflict: same key but different content
      if (receipt.type !== validated.type || receipt.status !== validated.status || receipt.summary !== validated.summary) {
        return errorResponse(c, 409, 'idempotency_conflict', 'A receipt with this idempotency_key already exists with different content.')
      }

      const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'
      return c.json({
        receipt_id: receipt.id,
        type: receipt.type,
        status: receipt.status,
        summary: receipt.summary,
        verify_url: `${baseUrl}/verify/${receipt.id}`,
        created_at: receipt.createdAt.toISOString(),
        expires_at: receipt.expiresAt.toISOString(),
        idempotency_key: receipt.idempotencyKey,
      }, 200)
    }
  }

  const receiptId = generateReceiptId()
  const expiresIn = validated.expires_in || 86400
  const expiresAt = new Date(Date.now() + expiresIn * 1000)

  await db.insert(receipts).values({
    id: receiptId,
    apiKeyId: apiKeyRecord.id,
    type: validated.type,
    status: validated.status,
    summary: validated.summary,
    payload: validated.payload || null,
    ref: validated.ref || null,
    idempotencyKey: validated.idempotency_key || null,
    expiresAt,
  })

  // Increment usage count (must await — Vercel kills execution after response)
  await db.update(apiKeys)
    .set({ usageCount: sql`${apiKeys.usageCount} + 1` })
    .where(eq(apiKeys.id, apiKeyRecord.id))
    .catch(() => {})

  const baseUrl = process.env.BASE_URL || 'https://proofslip.ai'

  return c.json({
    receipt_id: receiptId,
    type: validated.type,
    status: validated.status,
    summary: validated.summary,
    verify_url: `${baseUrl}/verify/${receiptId}`,
    created_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    idempotency_key: validated.idempotency_key || null,
  }, 201)
})

export { receiptsRouter }
```

- [ ] **Step 2: Wire route into src/index.ts**

```typescript
import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)

export default app
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/receipts.ts src/index.ts
git commit -m "feat: add POST /v1/receipts with validation and idempotency"
```

---

## Task 6: Verify Endpoint, HTML Page, and Deploy

**Files:**
- Create: `src/routes/verify.ts`, `src/views/verify-page.ts`, `src/views/not-found-page.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Create src/views/verify-page.ts**

Uses [Departure Mono](https://departuremono.com/) (SIL OFL, free for commercial use) for the receipt aesthetic — lo-fi, techy, terminal-receipt vibe. The verify page should feel like a printed receipt from a machine, not a generic web card.

```typescript
export function renderVerifyPage(receipt: {
  id: string
  type: string
  status: string
  summary: string
  payload: unknown
  createdAt: string
  expiresAt: string
}): string {
  const payloadHtml = receipt.payload
    ? `<details><summary>&gt; view payload</summary><pre>${escapeHtml(JSON.stringify(receipt.payload, null, 2))}</pre></details>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt ${receipt.id} | ProofSlip</title>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/rektdeckard/departure-mono@latest/fonts/DepartureMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face {
      font-family: 'Departure Mono';
      src: url('https://cdn.jsdelivr.net/gh/rektdeckard/departure-mono@latest/fonts/DepartureMono-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Departure Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2rem 1rem;
    }
    .receipt {
      background: #fafaf5;
      color: #1a1a1a;
      max-width: 420px;
      width: 100%;
      padding: 2rem 1.5rem;
      position: relative;
    }
    /* Torn paper edge effect at bottom */
    .receipt::after {
      content: '';
      display: block;
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(135deg, #fafaf5 33.33%, transparent 33.33%) -8px 0,
                  linear-gradient(225deg, #fafaf5 33.33%, transparent 33.33%) -8px 0;
      background-size: 16px 8px;
    }
    .receipt-header {
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 1px dashed #ccc;
      margin-bottom: 1rem;
    }
    .receipt-header h1 {
      font-size: 1rem;
      font-weight: normal;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    }
    .verified-badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      border: 1px solid #16a34a;
      color: #16a34a;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .receipt-id {
      text-align: center;
      font-size: 0.65rem;
      color: #999;
      margin-bottom: 1rem;
    }
    .divider {
      border: none;
      border-top: 1px dashed #ccc;
      margin: 1rem 0;
    }
    .row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
      line-height: 1.4;
    }
    .row .label {
      color: #888;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      flex-shrink: 0;
    }
    .row .value {
      text-align: right;
      max-width: 65%;
      word-break: break-word;
    }
    .summary-block {
      margin: 1rem 0;
      padding: 0.75rem;
      background: #f0f0ea;
      font-size: 0.8rem;
      line-height: 1.5;
    }
    details { margin-top: 1rem; }
    summary {
      cursor: pointer;
      font-size: 0.7rem;
      color: #888;
      letter-spacing: 0.05em;
    }
    pre {
      background: #f0f0ea;
      padding: 0.75rem;
      overflow-x: auto;
      font-size: 0.65rem;
      margin-top: 0.5rem;
      font-family: 'Departure Mono', monospace;
    }
    .receipt-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px dashed #ccc;
    }
    .receipt-footer a {
      color: #888;
      text-decoration: none;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .receipt-footer a:hover { color: #1a1a1a; }
    .receipt-footer .tagline {
      font-size: 0.6rem;
      color: #bbb;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>ProofSlip</h1>
      <div class="verified-badge">Verified</div>
    </div>
    <div class="receipt-id">${escapeHtml(receipt.id)}</div>
    <div class="row"><span class="label">Type</span><span class="value">${escapeHtml(receipt.type)}</span></div>
    <div class="row"><span class="label">Status</span><span class="value">${escapeHtml(receipt.status)}</span></div>
    <div class="summary-block">${escapeHtml(receipt.summary)}</div>
    <hr class="divider">
    <div class="row"><span class="label">Created</span><span class="value">${new Date(receipt.createdAt).toUTCString()}</span></div>
    <div class="row"><span class="label">Expires</span><span class="value">${new Date(receipt.expiresAt).toUTCString()}</span></div>
    ${payloadHtml}
    <div class="receipt-footer">
      <a href="/">proofslip.ai</a>
      <div class="tagline">ephemeral verification for agent workflows</div>
    </div>
  </div>
</body>
</html>`
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
```

- [ ] **Step 2: Create src/views/not-found-page.ts**

Same Departure Mono receipt aesthetic, but faded/expired look.

```typescript
export function renderNotFoundPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt Not Found | ProofSlip</title>
  <link rel="preload" href="https://cdn.jsdelivr.net/gh/rektdeckard/departure-mono@latest/fonts/DepartureMono-Regular.woff2" as="font" type="font/woff2" crossorigin>
  <style>
    @font-face {
      font-family: 'Departure Mono';
      src: url('https://cdn.jsdelivr.net/gh/rektdeckard/departure-mono@latest/fonts/DepartureMono-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Departure Mono', monospace;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }
    .receipt {
      background: #fafaf5;
      color: #ccc;
      max-width: 420px;
      width: 100%;
      padding: 2rem 1.5rem;
      position: relative;
      opacity: 0.7;
    }
    .receipt::after {
      content: '';
      display: block;
      position: absolute;
      bottom: -8px;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(135deg, #fafaf5 33.33%, transparent 33.33%) -8px 0,
                  linear-gradient(225deg, #fafaf5 33.33%, transparent 33.33%) -8px 0;
      background-size: 16px 8px;
      opacity: 0.7;
    }
    .receipt-header {
      text-align: center;
      padding-bottom: 1rem;
      border-bottom: 1px dashed #ddd;
      margin-bottom: 1rem;
    }
    .receipt-header h1 {
      font-size: 1rem;
      font-weight: normal;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #bbb;
    }
    .expired-badge {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.25rem 0.75rem;
      border: 1px solid #999;
      color: #999;
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .message {
      text-align: center;
      font-size: 0.75rem;
      line-height: 1.6;
      color: #aaa;
      margin: 1.5rem 0;
    }
    .receipt-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px dashed #ddd;
    }
    .receipt-footer a {
      color: #999;
      text-decoration: none;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .receipt-footer a:hover { color: #666; }
    .receipt-footer .tagline {
      font-size: 0.6rem;
      color: #ccc;
      margin-top: 0.25rem;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>ProofSlip</h1>
      <div class="expired-badge">Expired / Not Found</div>
    </div>
    <div class="message">This receipt does not exist, has expired, or has been deleted.<br>Receipts expire 24 hours after creation.</div>
    <div class="receipt-footer">
      <a href="/">proofslip.ai</a>
      <div class="tagline">ephemeral verification for agent workflows</div>
    </div>
  </div>
</body>
</html>`
}
```

- [ ] **Step 3: Create src/routes/verify.ts**

```typescript
import { Hono } from 'hono'
import { getDb } from '../db/client.js'
import { receipts } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { renderVerifyPage } from '../views/verify-page.js'
import { renderNotFoundPage } from '../views/not-found-page.js'

const verifyRouter = new Hono()

verifyRouter.get('/:receiptId', async (c) => {
  const receiptId = c.req.param('receiptId')
  const db = getDb()

  const results = await db
    .select()
    .from(receipts)
    .where(eq(receipts.id, receiptId))

  const receipt = results[0]

  if (!receipt || receipt.expiresAt < new Date()) {
    const wantsJson =
      c.req.header('Accept')?.includes('application/json') ||
      c.req.query('format') === 'json'

    if (wantsJson) {
      return c.json(
        { error: 'receipt_not_found', message: 'Receipt does not exist, has expired, or has been deleted.' },
        404
      )
    }
    return c.html(renderNotFoundPage(), 404)
  }

  const wantsJson =
    c.req.header('Accept')?.includes('application/json') ||
    c.req.query('format') === 'json'

  if (wantsJson) {
    return c.json({
      receipt_id: receipt.id,
      valid: true,
      type: receipt.type,
      status: receipt.status,
      summary: receipt.summary,
      payload: receipt.payload,
      ref: receipt.ref,
      created_at: receipt.createdAt.toISOString(),
      expires_at: receipt.expiresAt.toISOString(),
      expired: false,
    })
  }

  return c.html(renderVerifyPage({
    id: receipt.id,
    type: receipt.type,
    status: receipt.status,
    summary: receipt.summary,
    payload: receipt.payload,
    createdAt: receipt.createdAt.toISOString(),
    expiresAt: receipt.expiresAt.toISOString(),
  }))
})

export { verifyRouter }
```

- [ ] **Step 4: Wire verify routes into src/index.ts**

```typescript
import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { verifyRouter } from './routes/verify.js'

const app = new Hono()

app.get('/health', (c) => c.json({ status: 'ok' }))
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter) // canonical public URL

export default app
```

- [ ] **Step 5: Test locally end-to-end**

```bash
npm run dev
```

Using the API key from Task 2 Step 12:

```bash
# Create a receipt
curl -X POST http://localhost:3000/v1/receipts \
  -H "Authorization: Bearer ak_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{"type":"action","status":"success","summary":"Test email sent to customer #42"}'

# Verify it (JSON)
curl http://localhost:3000/verify/rct_xxxxx?format=json

# Open in browser to see HTML verify page
# http://localhost:3000/verify/rct_xxxxx
```

- [ ] **Step 6: Deploy to Vercel**

```bash
npx vercel --prod
```

During setup:
- Link to your Vercel account
- Set environment variables: `DATABASE_URL`, `BASE_URL` (your Vercel URL e.g. `https://proofslip.vercel.app`)

- [ ] **Step 7: Verify production deployment**

```bash
curl https://your-app.vercel.app/health
curl -X POST https://your-app.vercel.app/v1/receipts \
  -H "Authorization: Bearer ak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"type":"action","status":"success","summary":"First production receipt"}'
```

Open the verify URL in a browser. You should see the green "Verified" card with the CTA footer.

- [ ] **Step 8: Commit**

```bash
git add src/routes/verify.ts src/views/ src/index.ts
git commit -m "feat: add verify endpoint with HTML page, deploy to Vercel"
```

---

## Phase 1 Complete

At this point you have a live, deployed API with:

- `POST /v1/receipts` — create receipts (auth required)
- `GET /verify/{id}` — verify receipts (public, HTML + JSON)
- Manually seeded API keys for yourself and early testers
- Viral CTA on every verify page

**What to do next:** Share API keys with a few developers. Create receipts in your own agent workflows. Watch if verify URLs get hit by other parties. That's the signal.

---

## Phase 2 — Build Only If Usage Signal

| Feature | When to build |
|---------|--------------|
| Self-serve signup (`POST /v1/auth/signup`) | When you want to stop manually seeding keys |
| Rate limiting | When you see abuse or high traffic |
| Landing page with signup form | When you want organic signups from verify page CTAs |
| TTL cron cleanup | When expired rows start piling up (check weekly manually until then) |
| Magic-link login + key rotation | When users ask for it |
| Stripe integration | When someone asks to pay |
| Usage tracking + overage billing | When you have paying customers |

**Manual TTL cleanup until cron is needed:**

```sql
DELETE FROM receipts WHERE expires_at < NOW();
```

Run this in Neon's SQL console once a day or whenever you remember. Automate later.

---

## Summary

| Task | What | Phase |
|------|------|-------|
| 1 | Project scaffolding | Phase 1 |
| 2 | Database + schema + seed script + helpers | Phase 1 |
| 3 | Request validation + error helpers | Phase 1 |
| 4 | API key auth middleware | Phase 1 |
| 5 | POST /v1/receipts | Phase 1 |
| 6 | GET /verify/:id + HTML page + deploy | Phase 1 |
| — | Self-serve signup, rate limiting, landing page, cron, Stripe | Phase 2 (if traction) |
