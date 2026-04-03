# @proofslip/mcp-server

MCP server for [ProofSlip](https://proofslip.ai) — receipt-based verification for AI agent workflows. Create, verify, and poll ephemeral receipts that let agents prove what happened before deciding what happens next.

## Tools

| Tool | Auth | Description |
|------|------|-------------|
| `create_receipt` | API key | Create a receipt (action, approval, handshake, resume, failure) |
| `verify_receipt` | None | Verify a receipt and retrieve full data |
| `check_receipt_status` | None | Lightweight status poll (no payload) |
| `signup` | None | Get a free API key (500 receipts/month) |

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

### Cursor

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

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PROOFSLIP_API_KEY` | For creating receipts | Your ProofSlip API key (starts with `ak_`) |
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
