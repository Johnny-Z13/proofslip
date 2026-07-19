import { FONT_FACE_CSS } from './font.js'

export function renderDocsPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofSlip Docs — GitHub Actions Release Proofs</title>
  <meta name="description" content="Create provider-backed, publicly verifiable release proofs from GitHub Actions using OIDC.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://proofslip.ai/docs">
  <meta property="og:title" content="ProofSlip Release Proof API">
  <meta property="og:description" content="A public proof that a specific GitHub Actions job ran for a specific commit.">
  <meta property="og:image" content="https://proofslip.ai/og-image.png">
  <meta property="og:url" content="https://proofslip.ai/docs">
  <meta property="og:type" content="website">
  <style>
    ${FONT_FACE_CSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Departure Mono', monospace; font-size: 15px; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; padding: 4rem 1.5rem; line-height: 1.7; }
    .docs { max-width: 820px; margin: 0 auto; }
    a { color: #16a34a; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 1rem; color: #666; font-size: 0.8rem; }
    .docs-header { margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid #202020; }
    .docs-header h1 { font-size: 1.55rem; font-weight: normal; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 0.5rem; }
    .docs-header p { color: #888; }
    .docs-nav, .callout { border: 1px solid #242424; background: #0e0e0e; padding: 1.25rem; margin-bottom: 2.5rem; }
    .warning { border-color: #5d4712; background: #151208; color: #d2b45f; }
    .docs-nav ul { list-style: none; columns: 2; }
    .docs-nav li { margin-bottom: 0.35rem; }
    .docs-nav a { color: #888; font-size: 0.84rem; }
    section { margin-bottom: 3.5rem; }
    h2 { font-size: 1rem; font-weight: normal; letter-spacing: 0.08em; text-transform: uppercase; color: #16a34a; margin-bottom: 1.2rem; padding-bottom: 0.5rem; border-bottom: 1px solid #202020; }
    h3 { font-size: 0.9rem; color: #ddd; font-weight: normal; margin: 1.5rem 0 0.7rem; }
    p { color: #aaa; font-size: 0.86rem; margin-bottom: 0.85rem; }
    pre { background: #111; border: 1px solid #242424; padding: 1rem 1.2rem; margin-bottom: 1rem; overflow-x: auto; white-space: pre; color: #ccc; font: 0.78rem/1.65 'Departure Mono', monospace; }
    code, .code { font-family: 'Departure Mono', monospace; color: #ccc; }
    .code { background: #151515; padding: 0.12rem 0.35rem; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-size: 0.78rem; }
    th { color: #666; font-weight: normal; text-align: left; text-transform: uppercase; padding: 0.55rem 0.7rem; border-bottom: 1px solid #242424; }
    td { color: #aaa; padding: 0.55rem 0.7rem; border-bottom: 1px solid #151515; vertical-align: top; }
    .method { display: inline-block; padding: 0.12rem 0.45rem; margin-right: 0.45rem; font-size: 0.72rem; }
    .post { background: #163423; color: #3cc875; }
    .get { background: #142b3a; color: #63b6e7; }
    .badge { display: inline-block; border: 1px solid #333; color: #888; font-size: 0.7rem; padding: 0.16rem 0.45rem; margin-bottom: 0.8rem; }
    .public { border-color: #245b36; color: #3cc875; }
    ul.plain { padding-left: 1.25rem; color: #aaa; font-size: 0.86rem; }
    ul.plain li { margin-bottom: 0.45rem; }
    footer { margin-top: 4rem; padding-top: 1.5rem; border-top: 1px solid #202020; color: #555; font-size: 0.75rem; text-align: center; }
    @media (max-width: 640px) { .docs-nav ul { columns: 1; } body { padding-top: 2rem; } }
  </style>
</head>
<body>
<main class="docs">
  <a href="/" class="back-link">&larr; proofslip.ai</a>
  <header class="docs-header">
    <h1>Release Proof API</h1>
    <p>Verify the GitHub Actions job identity behind a release and publish a proof URL anyone can inspect.</p>
  </header>

  <nav class="docs-nav">
    <ul>
      <li><a href="#skill">Agent Skill</a></li>
      <li><a href="#quickstart">GitHub Actions quickstart</a></li>
      <li><a href="#trust">Trust model</a></li>
      <li><a href="#create-proof">Create a release proof</a></li>
      <li><a href="#fetch-proof">Fetch a release proof</a></li>
      <li><a href="#privacy">Public access and retention</a></li>
      <li><a href="#legacy">Legacy receipt API</a></li>
      <li><a href="#errors">Errors</a></li>
      <li><a href="#discovery">Machine discovery</a></li>
    </ul>
  </nav>

  <section id="skill">
    <h2>Agent Skill</h2>
    <p>Install the readable, repository-owned skill for Codex, Claude Code, Cursor, and other skills-compatible coding agents:</p>
    <pre>npx skills add Johnny-Z13/proofslip --skill proofslip-release-proof</pre>
    <p>The skill can verify an existing proof URL or prepare a minimal edit to the GitHub Actions workflow that actually releases the project. It inspects first, shows the proposed change, asks before editing, and does not commit, push, or release without separate authorization.</p>
    <p><a href="https://github.com/Johnny-Z13/proofslip/tree/master/.agents/skills/proofslip-release-proof">Read the skill, verification helper, and workflow template on GitHub.</a></p>
  </section>

  <section id="quickstart">
    <h2>Manual GitHub Actions quickstart</h2>
    <p>No ProofSlip account or API key is needed. The workflow requests a GitHub OIDC token whose audience is <span class="code">https://proofslip.ai</span>, then exchanges it for a public proof.</p>
    <pre>permissions:
  contents: read
  id-token: write

steps:
  - name: Create release proof
    shell: bash
    run: |
      TOKEN="$(curl -sSf \\
        -H "Authorization: bearer \${ACTIONS_ID_TOKEN_REQUEST_TOKEN}" \\
        "\${ACTIONS_ID_TOKEN_REQUEST_URL}&amp;audience=https%3A%2F%2Fproofslip.ai" \\
        | jq -r .value)"

      BODY="$(jq -n \\
        --arg key "\${GITHUB_REPOSITORY}:\${GITHUB_RUN_ID}:\${GITHUB_RUN_ATTEMPT}" \\
        '{idempotency_key:$key}')"

      curl --fail-with-body -sS \\
        -X POST https://proofslip.ai/v1/proofs/releases/github-actions \\
        -H "Authorization: Bearer \${TOKEN}" \\
        -H "Content-Type: application/json" \\
        --data "\${BODY}"</pre>
    <p>The response includes <span class="code">proof_url</span> for humans and <span class="code">proof_id</span> for the JSON API.</p>
  </section>

  <section id="trust">
    <h2>Trust model</h2>
    <table>
      <tr><th>Category</th><th>Source</th><th>Meaning</th></tr>
      <tr><td>issuer</td><td>GitHub OIDC, provider-verified</td><td>Identity and execution context of the workflow job that requested the token.</td></tr>
      <tr><td>observations</td><td>ProofSlip</td><td>An optional HTTP status observed at issuance time. Separate from GitHub's claims.</td></tr>
      <tr><td>submitted_context</td><td>Workflow input</td><td>Caller-supplied labels. Stored and displayed as unverified.</td></tr>
    </table>
    <div class="callout warning"><strong>It does not prove</strong> that tests passed, that the full workflow succeeded, or that a deployment contains the claimed commit. Those require stronger, separate evidence.</div>
  </section>

  <section id="create-proof">
    <h2><span class="method post">POST</span>/v1/proofs/releases/github-actions</h2>
    <div class="badge">GitHub Actions OIDC required</div>
    <p>Send <span class="code">Authorization: Bearer &lt;GitHub OIDC token&gt;</span>. The token must be signed by GitHub, use the ProofSlip audience, be inside its validity window, and contain the required workflow claims.</p>
    <h3>Optional request body</h3>
    <pre>{
  "schema_version": "release-proof/v1",
  "idempotency_key": "owner/repo:run_id:attempt",
  "deployment": {
    "url": "https://app.example.com",
    "health_path": "/health"
  },
  "submitted_context": {
    "environment": "production",
    "label": "web release"
  }
}</pre>
    <p>Deployment checks accept only public HTTPS hosts on the default port. Redirects are not followed, response bodies are not read, and observation failure does not invalidate the provider-backed proof.</p>
    <h3>Response</h3>
    <pre>{
  "proof_id": "prf_...",
  "proof_url": "https://proofslip.ai/proof/prf_...",
  "schema_version": "release-proof/v1",
  "is_valid": true,
  "is_expired": false,
  "trust_level": "provider_verified",
  "verification_method": "github_actions_oidc",
  "issuer": {
    "type": "github_actions",
    "repository": "owner/repo",
    "ref": "refs/heads/main",
    "sha": "...",
    "run_id": "...",
    "run_attempt": 1,
    "run_url": "https://github.com/owner/repo/actions/runs/..."
  },
  "observations": [],
  "submitted_context": null,
  "issued_at": "...",
  "expires_at": "..."
}</pre>
    <p>Returns 201 when created and 200 for an identical token replay or idempotent retry. Conflicting reuse returns 409.</p>
  </section>

  <section id="fetch-proof">
    <h2><span class="method get">GET</span>/v1/proofs/{proof_id}</h2>
    <div class="badge public">Public — no auth</div>
    <p>Returns the machine-readable proof. The human view is <span class="code">GET /proof/{proof_id}</span>.</p>
    <pre>curl https://proofslip.ai/v1/proofs/prf_...</pre>
    <p>Within the 90-day validity window the response is 200. After expiry the full record remains inspectable, with <span class="code">is_expired: true</span>, and the endpoint returns 410.</p>
  </section>

  <section id="privacy">
    <h2>Public access and retention</h2>
    <div class="callout warning"><strong>Proof URLs are public, including proofs from private repositories.</strong> GitHub repository metadata and any submitted context in the proof can be read by anyone with the URL.</div>
    <p>Release proofs have a 90-day validity window. V1 keeps expired records inspectable rather than deleting them automatically. See the <a href="/privacy">privacy policy</a> before enabling this in a private repository.</p>
  </section>

  <section id="legacy">
    <h2>Legacy receipt API</h2>
    <p>The original general-purpose receipt API remains operational for agent handshakes, approvals, resumable workflows, and short-lived action records. It is separate from provider-backed release proofs.</p>
    <table>
      <tr><th>Endpoint</th><th>Auth</th><th>Purpose</th></tr>
      <tr><td>POST /v1/auth/signup</td><td>None</td><td>Create an API key for receipts.</td></tr>
      <tr><td>POST /v1/receipts</td><td>ProofSlip API key</td><td>Create a receipt with a 60-second to 24-hour TTL.</td></tr>
      <tr><td>GET /v1/verify/{receipt_id}</td><td>None</td><td>Fetch a valid receipt.</td></tr>
      <tr><td>GET /v1/receipts/{receipt_id}/status</td><td>None</td><td>Lightweight polling response.</td></tr>
    </table>
    <p>MCP: <span class="code">npx -y @proofslip/mcp-server</span>. LangChain: <span class="code">pip install langchain-proofslip</span>. These published integrations currently expose the legacy receipt tools.</p>
  </section>

  <section id="errors">
    <h2>Errors</h2>
    <pre>{"error":"error_code","message":"Description","request_id":"req_..."}</pre>
    <table>
      <tr><th>Code</th><th>HTTP</th><th>Meaning</th></tr>
      <tr><td>validation_error</td><td>400</td><td>Invalid request body.</td></tr>
      <tr><td>unsupported_issuer</td><td>400</td><td>Attestation issuer is not GitHub Actions.</td></tr>
      <tr><td>invalid_attestation</td><td>401</td><td>OIDC signature, audience, time, or claim validation failed.</td></tr>
      <tr><td>proof_not_found</td><td>404</td><td>Unknown proof ID.</td></tr>
      <tr><td>idempotency_conflict</td><td>409</td><td>Token or idempotency key reused with different content.</td></tr>
      <tr><td>payload_too_large</td><td>413</td><td>Request exceeds 16KB.</td></tr>
      <tr><td>rate_limited</td><td>429</td><td>Request limit exceeded.</td></tr>
    </table>
  </section>

  <section id="discovery">
    <h2>Machine discovery</h2>
    <table>
      <tr><th>Endpoint</th><th>Purpose</th></tr>
      <tr><td><a href="/llms.txt">/llms.txt</a></td><td>Compact agent context.</td></tr>
      <tr><td><a href="/llms-full.txt">/llms-full.txt</a></td><td>Complete agent-facing contract.</td></tr>
      <tr><td><a href="/.well-known/openapi.json">/.well-known/openapi.json</a></td><td>OpenAPI 3.1 specification.</td></tr>
      <tr><td><a href="/.well-known/agent.json">/.well-known/agent.json</a></td><td>Agent discovery manifest.</td></tr>
      <tr><td><a href="/.well-known/mcp.json">/.well-known/mcp.json</a></td><td>Legacy receipt MCP package discovery.</td></tr>
    </table>
  </section>

  <footer>ProofSlip — verify the job, separate the evidence, share the proof.</footer>
</main>
</body>
</html>`
}
