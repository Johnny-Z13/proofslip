# @proofslip/sdk

[![npm version](https://img.shields.io/npm/v/@proofslip/sdk)](https://www.npmjs.com/package/@proofslip/sdk)
[![license](https://img.shields.io/npm/l/@proofslip/sdk)](https://github.com/Johnny-Z13/proofslip/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@proofslip/sdk)](https://nodejs.org)

TypeScript client for the [ProofSlip](https://proofslip.ai) API. Create, verify, and poll ephemeral receipts that let agents prove what happened before deciding what happens next.

Zero dependencies. Works in Node.js 18+ and any runtime with global `fetch`.

## Install

```bash
npm install @proofslip/sdk
```

## Quick Start

```typescript
import { ProofSlipClient } from '@proofslip/sdk'

const client = new ProofSlipClient({ apiKey: 'ak_your_key_here' })

// Create a receipt
const receipt = await client.createReceipt({
  type: 'action',
  status: 'success',
  summary: 'Sent welcome email to user@example.com',
  ref: { workflow_id: 'onboarding-123' },
})

console.log(receipt.receipt_id) // rct_...
console.log(receipt.verify_url) // https://proofslip.ai/v1/verify/rct_...

// Verify a receipt
const result = await client.verifyReceipt(receipt.receipt_id)
console.log(result.valid)   // true
console.log(result.summary) // "Sent welcome email to user@example.com"

// Poll until terminal
const final = await client.waitForTerminal('rct_approval_123', {
  onPoll: (status) => console.log(`Status: ${status.status}`),
})
```

## API

### `new ProofSlipClient(opts?)`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | string | `PROOFSLIP_API_KEY` env var | API key (starts with `ak_`) |
| `baseUrl` | string | `https://proofslip.ai` | API base URL |

### Methods

| Method | Auth Required | Description |
|--------|:---:|-------------|
| `createReceipt(input)` | Yes | Create a receipt. Returns `Receipt`. |
| `verifyReceipt(id)` | No | Verify a receipt. Returns `VerifyResult`. |
| `checkStatus(id)` | No | Lightweight status poll. Returns `StatusResult`. |
| `signup(email)` | No | Get a free API key. Returns `SignupResult`. |
| `waitForTerminal(id, opts?)` | No | Poll until `is_terminal` is true. Returns `StatusResult`. |
| `hasApiKey()` | -- | Check if an API key is configured. |

### Receipt Types

| Type | Description |
|------|-------------|
| `action` | Proves an action was performed (always terminal) |
| `approval` | Records a decision awaiting review |
| `handshake` | Confirms two agents established agreement |
| `resume` | Marks a workflow checkpoint (always terminal) |
| `failure` | Documents what went wrong (always terminal) |

### Error Handling

All methods throw `ProofSlipError` on failure:

```typescript
import { ProofSlipClient, ProofSlipError } from '@proofslip/sdk'

try {
  await client.createReceipt({ type: 'action', status: 'success', summary: 'test' })
} catch (err) {
  if (err instanceof ProofSlipError) {
    console.log(err.code)      // 'unauthorized', 'validation_error', etc.
    console.log(err.status)    // HTTP status code
    console.log(err.requestId) // present on 5xx errors
  }
}
```

### Polling Helper

`waitForTerminal` polls `checkStatus` using the server's recommended interval:

```typescript
const result = await client.waitForTerminal('rct_abc', {
  maxAttempts: 20,  // default 20
  onPoll: (s) => console.log(s.status),
})
```

Throws `ProofSlipError` with code `poll_timeout` if max attempts exceeded.

## Exports

```typescript
// Client
export { ProofSlipClient, ProofSlipClientOptions }

// Error
export { ProofSlipError }

// Polling utilities
export { isTerminal, getNextPollAfterSeconds }

// Types
export type {
  ReceiptType, CreateReceiptInput, Receipt,
  VerifyResult, StatusResult, SignupResult,
}
```

## Get an API Key

```bash
curl -X POST https://proofslip.ai/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "source": "api"}'
```

## Links

- [ProofSlip](https://proofslip.ai) — Live API
- [API Docs](https://proofslip.ai/docs)
- [@proofslip/mcp-server](https://www.npmjs.com/package/@proofslip/mcp-server) — MCP server (uses this SDK)
- [langchain-proofslip](https://pypi.org/project/langchain-proofslip/) — Python tools for LangChain
- [GitHub](https://github.com/Johnny-Z13/proofslip)

## License

[MIT](https://github.com/Johnny-Z13/proofslip/blob/master/LICENSE)
