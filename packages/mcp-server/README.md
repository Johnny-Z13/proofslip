# @proofslip/mcp-server

[![npm version](https://img.shields.io/npm/v/@proofslip/mcp-server)](https://www.npmjs.com/package/@proofslip/mcp-server)
[![license](https://img.shields.io/npm/l/@proofslip/mcp-server)](https://github.com/Johnny-Z13/proofslip/blob/master/LICENSE)
[![node](https://img.shields.io/node/v/@proofslip/mcp-server)](https://nodejs.org)

MCP server for [ProofSlip](https://proofslip.ai) — receipt-based verification for AI agent workflows. Create, verify, and poll ephemeral receipts that let agents prove what happened before deciding what happens next.

## Tools

### `create_receipt`
Create a receipt to record that something happened. Receipts expire after 24 hours by default.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | enum | Yes | `action`, `approval`, `handshake`, `resume`, `failure` |
| `status` | string | Yes | Freeform status (e.g. "success", "pending", "failed") |
| `summary` | string | Yes | What happened — max 280 chars |
| `payload` | object | No | Structured JSON data (max 4KB) |
| `ref` | object | No | Workflow references (run_id, agent_id, workflow_id, etc.) |
| `expires_in` | number | No | TTL in seconds (60–86400, default 24h) |
| `idempotency_key` | string | No | Prevents duplicate receipts on retry |
| `audience` | "human" | No | Enrich verify page with social cards |

**Requires:** `PROOFSLIP_API_KEY` environment variable.

### `verify_receipt`
Verify a receipt and retrieve its full data before deciding what to do next.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `receipt_id` | string | Yes | The receipt ID (starts with `rct_`) |

**No API key required.**

### `check_receipt_status`
Lightweight status poll — returns only status and polling guidance, no payload.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `receipt_id` | string | Yes | The receipt ID (starts with `rct_`) |

**No API key required.** Use this instead of `verify_receipt` when you only need to know if state has changed.

### `signup`
Get a free API key (500 receipts/month).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `email` | string | Yes | Your email address |

**No API key required.**

## Usage Example

```
You: "Create a receipt proving we sent the welcome email"

Agent calls create_receipt:
  type: "action"
  status: "success"
  summary: "Sent welcome email to user@example.com"
  ref: { workflow_id: "onboarding-123", agent_id: "email-agent" }

→ Returns receipt_id, verify_url, is_terminal: true

You: "Verify receipt rct_abc123 before sending the follow-up"

Agent calls verify_receipt:
  receipt_id: "rct_abc123"

→ Returns full receipt: type, status, summary, payload, ref
→ Agent confirms the action happened before proceeding

You: "Check if the approval is still pending"

Agent calls check_receipt_status:
  receipt_id: "rct_def456"

→ Returns: status: "pending", is_terminal: false, next_poll_after_seconds: 30
→ Agent waits 30s then checks again
```

## Setup

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "proofslip": {
      "command": "npx",
      "args": ["-y", "@proofslip/mcp-server"],
      "env": {
        "PROOFSLIP_API_KEY": "ak_your_key_here"
      }
    }
  }
}
```

### Cursor / Windsurf

Add to MCP settings:

```json
{
  "mcpServers": {
    "proofslip": {
      "command": "npx",
      "args": ["-y", "@proofslip/mcp-server"],
      "env": {
        "PROOFSLIP_API_KEY": "ak_your_key_here"
      }
    }
  }
}
```

### Claude Code

```bash
claude mcp add proofslip -- npx -y @proofslip/mcp-server
```

Then set your API key in your environment or `.env` file.

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `PROOFSLIP_API_KEY` | For creating receipts | Your API key (starts with `ak_`) |
| `PROOFSLIP_BASE_URL` | No | API base URL (default: `https://proofslip.ai`) |

## Get an API Key

Use the `signup` tool from any MCP client, or:

```bash
curl -X POST https://proofslip.ai/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "source": "api"}'
```

## Links

- [Live Site](https://proofslip.ai)
- [API Docs](https://proofslip.ai/docs)
- [Example Receipt](https://proofslip.ai/example)
- [Context Capsule](https://www.contextcapsule.ai) (sister product — execution context for handoffs)
- [GitHub](https://github.com/Johnny-Z13/proofslip)

## License

[MIT](https://github.com/Johnny-Z13/proofslip/blob/master/LICENSE)
