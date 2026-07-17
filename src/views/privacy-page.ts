import { FONT_FACE_CSS } from './font.js'

export function renderPrivacyPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — ProofSlip</title>
  <meta name="description" content="How ProofSlip handles public release proofs, legacy receipts, account data, and operational logs.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://proofslip.ai/privacy">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%230a0a0a'/><text x='50' y='68' text-anchor='middle' font-size='52' font-family='monospace' fill='%23e0e0e0'>P</text></svg>">
  <style>
    ${FONT_FACE_CSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Departure Mono', monospace; font-size: 15px; background: #0a0a0a; color: #e0e0e0; min-height: 100vh; padding: 4rem 1.5rem; line-height: 1.7; }
    .container { max-width: 760px; margin: 0 auto; }
    h1 { color: #16a34a; font-size: 1.6rem; margin-bottom: 0.5rem; }
    h2 { color: #16a34a; font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #b0b0b0; }
    .updated, .note { color: #777; font-size: 0.85rem; }
    .updated { margin-bottom: 2rem; }
    .warning { border: 1px solid #5d4712; background: #151208; padding: 1rem; color: #d2b45f; }
    a { color: #16a34a; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { margin-bottom: 1rem; padding-left: 1.5rem; color: #b0b0b0; }
    li { margin-bottom: 0.55rem; }
    strong { color: #ddd; }
  </style>
</head>
<body>
  <main class="container">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: July 18, 2026</p>

    <h2>What ProofSlip does</h2>
    <p>ProofSlip creates provider-backed release proofs and also operates a legacy API for short-lived workflow receipts. This policy covers the service at proofslip.ai.</p>

    <h2>Release proofs are public</h2>
    <p class="warning"><strong>Anyone with a proof URL can read the proof.</strong> This includes proofs created from private repositories. Before enabling ProofSlip in a private repository, review which GitHub claims and submitted labels will become public.</p>
    <p>A release proof separates three categories:</p>
    <ul>
      <li><strong>Provider-verified issuer claims</strong> — repository and owner identity, repository visibility, ref, commit SHA, workflow reference, run ID and attempt, actor, event, and subject extracted from a GitHub Actions OIDC token.</li>
      <li><strong>ProofSlip observations</strong> — optional deployment URL, HTTP status, response time, and observation timestamp.</li>
      <li><strong>Submitted context</strong> — optional labels supplied by the workflow and displayed as unverified.</li>
    </ul>
    <p>The raw GitHub OIDC token is not stored or logged. Its token ID is stored only as a SHA-256 digest for replay protection.</p>

    <h2>Other data we collect</h2>
    <ul>
      <li><strong>Legacy receipt data</strong> — type, status, summary, optional payload and references submitted through the receipt API.</li>
      <li><strong>Email address</strong> — collected only when creating an API key for the legacy receipt API or requesting transactional email.</li>
      <li><strong>API key metadata</strong> — one-way key hash, non-secret prefix, usage tier, creation time, and usage counters. Raw API keys are not retained after issuance.</li>
      <li><strong>Operational request logs</strong> — timestamp, method, path, status, latency, request ID, associated API-key ID where applicable, and source IP supplied by the hosting platform. Request bodies and authorization tokens are not logged.</li>
      <li><strong>Release-proof events</strong> — event type, timestamp, failure reason where applicable, repository visibility, and either a public repository slug or a SHA-256 digest for a non-public repository. These rows do not contain tokens, emails, IP addresses, or submitted payloads.</li>
    </ul>

    <h2>Retention</h2>
    <ul>
      <li><strong>Release proofs</strong> have a 90-day validity window. After 90 days they return HTTP 410 and are marked expired, but the full record remains publicly inspectable so it can show what was verified and when. V1 does not automatically delete expired proof records.</li>
      <li><strong>Legacy receipts</strong> expire after at most 24 hours and are permanently removed by automated cleanup.</li>
      <li><strong>Account and API-key records</strong> remain until deletion is requested or they are removed for security or operational reasons.</li>
      <li><strong>Application logs</strong> are held by our hosting provider under the configured service retention period.</li>
    </ul>

    <h2>Data we do not collect</h2>
    <ul>
      <li>No tracking cookies or client-side analytics scripts</li>
      <li>No advertising profiles</li>
      <li>No sale of personal data</li>
      <li>No deployment response bodies, response headers, certificates, or resolved IP addresses</li>
    </ul>

    <h2>Service providers</h2>
    <ul>
      <li><strong>Neon</strong> — PostgreSQL database hosting</li>
      <li><strong>Vercel</strong> — application hosting, request handling, and operational logs</li>
      <li><strong>Resend</strong> — transactional email delivery</li>
      <li><strong>GitHub</strong> — OIDC issuer and public signing-key provider for GitHub Actions attestations</li>
    </ul>

    <h2>Security</h2>
    <p>Traffic is encrypted with TLS. API keys and OIDC token IDs are one-way hashed before storage. Release creation verifies token signature, issuer, audience, time constraints, and required claims. Rate limits apply per key or source IP.</p>

    <h2>Your rights and deletion</h2>
    <p>You can request deletion of account data, release proofs, or other associated records by emailing <a href="mailto:hello@proofslip.ai">hello@proofslip.ai</a>. Include the relevant proof IDs or account email. We may request reasonable verification before deleting records.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@proofslip.ai">hello@proofslip.ai</a></p>

    <p style="margin-top:3rem"><a href="/" style="color:#666">← proofslip.ai</a></p>
  </main>
</body>
</html>`
}
