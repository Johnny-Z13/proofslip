import { FONT_FACE_CSS } from './font.js'

export function renderDocsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofSlip API Docs — Ephemeral Receipts for AI Agent Workflows</title>
  <meta name="description" content="Complete API reference for ProofSlip. Create, verify, and poll ephemeral receipts for AI agent workflows.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://proofslip.ai/docs">
  <meta property="og:title" content="ProofSlip API Docs">
  <meta property="og:description" content="Complete API reference for ephemeral verification receipts.">
  <meta property="og:image" content="https://proofslip.ai/og-image.png">
  <meta property="og:url" content="https://proofslip.ai/docs">
  <meta property="og:type" content="website">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230a0a0a'/><text x='50' y='68' text-anchor='middle' font-size='52' font-family='monospace' fill='%23e0e0e0'>P</text></svg>">
  <style>
    ${FONT_FACE_CSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Departure Mono', monospace;
      font-size: 15px;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 4rem 1.5rem;
      line-height: 1.7;
    }
    .docs { max-width: 720px; margin: 0 auto; }
    a { color: #16a34a; text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* Header */
    .docs-header {
      margin-bottom: 3rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #1a1a1a;
    }
    .docs-header h1 {
      font-size: 1.5rem;
      font-weight: normal;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .docs-header p { color: #555; font-size: 0.85rem; }
    .back-link { font-size: 0.8rem; color: #444; margin-bottom: 1rem; display: inline-block; }
    .back-link:hover { color: #16a34a; }

    /* Nav */
    .docs-nav {
      margin-bottom: 3rem;
      padding: 1.25rem;
      border: 1px solid #1a1a1a;
      background: #0d0d0d;
    }
    .docs-nav-title { font-size: 0.7rem; color: #444; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.75rem; }
    .docs-nav ul { list-style: none; }
    .docs-nav li { margin-bottom: 0.35rem; }
    .docs-nav a { font-size: 0.85rem; color: #777; }
    .docs-nav a:hover { color: #16a34a; }

    /* Sections */
    .docs-section { margin-bottom: 3.5rem; }
    h2 {
      font-size: 1rem;
      font-weight: normal;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #16a34a;
      margin-bottom: 1.25rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #1a1a1a;
    }
    h3 {
      font-size: 0.9rem;
      font-weight: normal;
      color: #ccc;
      margin-bottom: 0.75rem;
      margin-top: 1.5rem;
    }
    p { margin-bottom: 0.75rem; color: #aaa; font-size: 0.85rem; }

    /* Code blocks */
    pre {
      background: #111;
      border: 1px solid #1a1a1a;
      padding: 1rem 1.25rem;
      margin-bottom: 1rem;
      overflow-x: auto;
      font-size: 0.8rem;
      line-height: 1.6;
      color: #ccc;
    }
    code { font-family: 'Departure Mono', monospace; }
    .inline-code {
      background: #151515;
      padding: 0.15rem 0.4rem;
      font-size: 0.8rem;
      color: #ccc;
    }

    /* Method badges */
    .method {
      display: inline-block;
      padding: 0.15rem 0.5rem;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
      margin-right: 0.5rem;
    }
    .method-post { background: #1a3a2a; color: #16a34a; }
    .method-get { background: #1a2a3a; color: #4a9eda; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.8rem; }
    th { text-align: left; color: #555; font-weight: normal; text-transform: uppercase; font-size: 0.7rem; letter-spacing: 0.05em; padding: 0.5rem 0.75rem; border-bottom: 1px solid #1a1a1a; }
    td { padding: 0.5rem 0.75rem; border-bottom: 1px solid #111; color: #aaa; }
    tr:hover td { background: #0d0d0d; }
    .required { color: #16a34a; }

    /* Auth badge */
    .auth-badge { font-size: 0.7rem; color: #444; border: 1px solid #222; padding: 0.2rem 0.5rem; display: inline-block; margin-bottom: 0.75rem; }
    .auth-badge.public { border-color: #1a3a2a; color: #16a34a; }

    /* Footer */
    .docs-footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid #1a1a1a; font-size: 0.75rem; color: #333; text-align: center; }
  </style>
</head>
<body>
<div class="docs">
  <a href="/" class="back-link">&larr; proofslip.ai</a>
  <div class="docs-header">
    <h1>API Reference</h1>
    <p>Create, verify, and poll ephemeral receipts for AI agent workflows.</p>
  </div>

  <nav class="docs-nav">
    <div class="docs-nav-title">Contents</div>
    <ul>
      <li><a href="#auth">Authentication</a></li>
      <li><a href="#create">POST /v1/receipts</a></li>
      <li><a href="#verify">GET /v1/verify/{id}</a></li>
      <li><a href="#status">GET /v1/receipts/{id}/status</a></li>
      <li><a href="#signup">POST /v1/auth/signup</a></li>
      <li><a href="#types">Receipt Types</a></li>
      <li><a href="#errors">Errors</a></li>
      <li><a href="#mcp">MCP Server</a></li>
      <li><a href="#discovery">Machine Discovery</a></li>
    </ul>
  </nav>

  <!-- AUTH -->
  <section class="docs-section" id="auth">
    <h2>Authentication</h2>
    <p>Pass your API key as a Bearer token:</p>
    <pre>Authorization: Bearer ak_live_...</pre>
    <p>Get a free key by calling <a href="#signup">POST /v1/auth/signup</a>. Verification endpoints are public.</p>
    <table>
      <tr><th>Limit</th><th>Value</th></tr>
      <tr><td>Rate limit</td><td>60 req/min per API key</td></tr>
      <tr><td>Free tier</td><td>500 receipts/month</td></tr>
      <tr><td>Max body</td><td>16 KB</td></tr>
      <tr><td>Max summary</td><td>280 chars</td></tr>
      <tr><td>Max payload</td><td>4 KB</td></tr>
    </table>
  </section>

  <!-- CREATE -->
  <section class="docs-section" id="create">
    <h2><span class="method method-post">POST</span> /v1/receipts</h2>
    <div class="auth-badge">Auth required</div>
    <p>Create a verifiable receipt when something happens in your agent workflow.</p>

    <h3>Request Body</h3>
    <table>
      <tr><th>Field</th><th>Type</th><th></th><th>Description</th></tr>
      <tr><td>type</td><td>string</td><td class="required">required</td><td>action, approval, handshake, resume, or failure</td></tr>
      <tr><td>status</td><td>string</td><td class="required">required</td><td>Freeform status (e.g. "success", "pending")</td></tr>
      <tr><td>summary</td><td>string</td><td class="required">required</td><td>Human-readable summary, max 280 chars</td></tr>
      <tr><td>payload</td><td>object</td><td></td><td>Structured JSON data, max 4KB</td></tr>
      <tr><td>ref</td><td>object</td><td></td><td>run_id, agent_id, action_id, workflow_id, session_id</td></tr>
      <tr><td>expires_in</td><td>integer</td><td></td><td>TTL in seconds, 60&ndash;86400. Default 86400</td></tr>
      <tr><td>idempotency_key</td><td>string</td><td></td><td>Prevents duplicate creation on retry</td></tr>
      <tr><td>audience</td><td>string</td><td></td><td>"human" for enriched social cards</td></tr>
    </table>

    <h3>Example</h3>
    <pre>POST /v1/receipts
Authorization: Bearer ak_live_abc123
Content-Type: application/json

{
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 to customer #8812",
  "payload": {"amount": 42.00, "currency": "USD"},
  "idempotency_key": "refund-8812-2026-03-23"
}</pre>

    <h3>Response (201)</h3>
    <pre>{
  "receipt_id": "rct_k7x9m2p4",
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 to customer #8812",
  "verify_url": "https://proofslip.ai/verify/rct_k7x9m2p4",
  "created_at": "2026-03-23T12:00:00Z",
  "expires_at": "2026-03-24T12:00:00Z",
  "is_terminal": true
}</pre>
  </section>

  <!-- VERIFY -->
  <section class="docs-section" id="verify">
    <h2><span class="method method-get">GET</span> /v1/verify/{receipt_id}</h2>
    <div class="auth-badge public">Public &mdash; no auth</div>
    <p>Verify a receipt and retrieve its full data. Returns HTML by default, or JSON with <span class="inline-code">?format=json</span>.</p>

    <h3>Example</h3>
    <pre>GET /v1/verify/rct_k7x9m2p4?format=json</pre>

    <h3>Response (200)</h3>
    <pre>{
  "receipt_id": "rct_k7x9m2p4",
  "valid": true,
  "type": "action",
  "status": "success",
  "summary": "Refund of $42.00 to customer #8812",
  "payload": {"amount": 42.00, "currency": "USD"},
  "created_at": "2026-03-23T12:00:00Z",
  "expires_at": "2026-03-24T12:00:00Z",
  "expired": false,
  "is_terminal": true
}</pre>
    <p>Returns 404 if the receipt is not found, expired, or deleted.</p>
  </section>

  <!-- STATUS -->
  <section class="docs-section" id="status">
    <h2><span class="method method-get">GET</span> /v1/receipts/{receipt_id}/status</h2>
    <div class="auth-badge public">Public &mdash; no auth</div>
    <p>Lightweight status poll. Returns only status fields &mdash; no summary, payload, or ref. Ideal for polling loops.</p>

    <h3>Response (200)</h3>
    <pre>{
  "receipt_id": "rct_k7x9m2p4",
  "status": "success",
  "is_terminal": true,
  "next_poll_after_seconds": null,
  "expires_at": "2026-03-23T13:00:00Z"
}</pre>
    <p>If <span class="inline-code">is_terminal</span> is true, stop polling. If false, wait <span class="inline-code">next_poll_after_seconds</span> before retrying.</p>
  </section>

  <!-- SIGNUP -->
  <section class="docs-section" id="signup">
    <h2><span class="method method-post">POST</span> /v1/auth/signup</h2>
    <div class="auth-badge public">Public &mdash; no auth</div>
    <p>Get a free API key. Save it immediately &mdash; it cannot be retrieved later.</p>

    <h3>Request Body</h3>
    <table>
      <tr><th>Field</th><th>Type</th><th></th><th>Description</th></tr>
      <tr><td>email</td><td>string</td><td class="required">required</td><td>Your email address</td></tr>
      <tr><td>source</td><td>string</td><td></td><td>"api" returns key directly, "web" emails it</td></tr>
    </table>

    <h3>Example</h3>
    <pre>POST /v1/auth/signup
Content-Type: application/json

{"email": "dev@example.com", "source": "api"}</pre>

    <h3>Response (201)</h3>
    <pre>{
  "api_key": "ak_live_abc123def456",
  "tier": "free",
  "message": "Save this key - it cannot be retrieved later."
}</pre>
  </section>

  <!-- TYPES -->
  <section class="docs-section" id="types">
    <h2>Receipt Types</h2>
    <table>
      <tr><th>Type</th><th>Use Case</th></tr>
      <tr><td>action</td><td>Record a completed event (refund, deploy, notification)</td></tr>
      <tr><td>approval</td><td>Gate an action on a human or agent decision</td></tr>
      <tr><td>handshake</td><td>Coordinate between two agents before either acts</td></tr>
      <tr><td>resume</td><td>Bookmark a safe continuation point in a pipeline</td></tr>
      <tr><td>failure</td><td>Structured error record with bounded retry window</td></tr>
    </table>
  </section>

  <!-- ERRORS -->
  <section class="docs-section" id="errors">
    <h2>Errors</h2>
    <p>All errors return JSON:</p>
    <pre>{"error": "error_code", "message": "Human-readable description", "request_id": "req_..."}</pre>
    <table>
      <tr><th>Code</th><th>HTTP</th><th>Meaning</th></tr>
      <tr><td>validation_error</td><td>400</td><td>Missing or invalid field</td></tr>
      <tr><td>unauthorized</td><td>401</td><td>Missing or invalid API key</td></tr>
      <tr><td>not_found</td><td>404</td><td>Receipt not found, expired, or deleted</td></tr>
      <tr><td>idempotency_conflict</td><td>409</td><td>Same key, different body</td></tr>
      <tr><td>rate_limited</td><td>429</td><td>Too many requests</td></tr>
      <tr><td>internal_error</td><td>500</td><td>Unexpected server error</td></tr>
    </table>
  </section>

  <!-- MCP -->
  <section class="docs-section" id="mcp">
    <h2>MCP Server</h2>
    <p>Use ProofSlip as a tool in Claude, Cursor, or any MCP-compatible client:</p>
    <pre>npx -y @proofslip/mcp-server</pre>
    <p>Tools: <span class="inline-code">create_receipt</span>, <span class="inline-code">verify_receipt</span>, <span class="inline-code">check_status</span></p>
  </section>

  <!-- DISCOVERY -->
  <section class="docs-section" id="discovery">
    <h2>Machine Discovery</h2>
    <p>ProofSlip exposes multiple discovery endpoints for agents and tools:</p>
    <table>
      <tr><th>Endpoint</th><th>Format</th><th>Purpose</th></tr>
      <tr><td><a href="/llms.txt">/llms.txt</a></td><td>Plain text</td><td>LLM context summary</td></tr>
      <tr><td><a href="/llms-full.txt">/llms-full.txt</a></td><td>Plain text</td><td>Complete API reference for LLMs</td></tr>
      <tr><td><a href="/.well-known/openapi.json">/.well-known/openapi.json</a></td><td>JSON</td><td>OpenAPI 3.1 spec</td></tr>
      <tr><td><a href="/.well-known/ai-plugin.json">/.well-known/ai-plugin.json</a></td><td>JSON</td><td>ChatGPT plugin manifest</td></tr>
      <tr><td><a href="/.well-known/mcp.json">/.well-known/mcp.json</a></td><td>JSON</td><td>MCP server discovery</td></tr>
      <tr><td><a href="/.well-known/agent.json">/.well-known/agent.json</a></td><td>JSON</td><td>Agent protocol discovery</td></tr>
    </table>
  </section>

  <footer class="docs-footer">
    ProofSlip &mdash; create, verify, expire.
  </footer>
</div>
</body>
</html>`;
}
