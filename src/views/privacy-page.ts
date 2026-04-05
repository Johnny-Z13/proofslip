import { FONT_FACE_CSS } from './font.js'

export function renderPrivacyPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — ProofSlip</title>
  <meta name="description" content="ProofSlip privacy policy. How we handle data in our ephemeral receipt API.">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://proofslip.ai/privacy">
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
    .container { max-width: 700px; margin: 0 auto; }
    h1 { color: #16a34a; font-size: 1.6rem; margin-bottom: 0.5rem; }
    h2 { color: #16a34a; font-size: 1.1rem; margin-top: 2rem; margin-bottom: 0.5rem; }
    p { margin-bottom: 1rem; color: #b0b0b0; }
    .updated { color: #666; font-size: 0.85rem; margin-bottom: 2rem; }
    a { color: #16a34a; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { margin-bottom: 1rem; padding-left: 1.5rem; color: #b0b0b0; }
    li { margin-bottom: 0.4rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated: April 5, 2026</p>

    <h2>What ProofSlip Is</h2>
    <p>ProofSlip is an API service that creates ephemeral, verifiable receipts for AI agent workflows. This policy covers data handling for the ProofSlip API at proofslip.ai.</p>

    <h2>Data We Collect</h2>
    <ul>
      <li><strong>Email address</strong> — collected at signup to issue API keys and send transactional emails only.</li>
      <li><strong>Receipt data</strong> — type, status, summary (max 280 chars), and optional payload (max 4KB) that you submit via the API. This is the data you explicitly send us.</li>
      <li><strong>API key metadata</strong> — hashed key, usage tier, creation date. We never store your raw API key after initial issuance.</li>
      <li><strong>Request logs</strong> — method, path, timestamp, and request ID for debugging. No receipt content is logged.</li>
    </ul>

    <h2>Data Retention</h2>
    <p>Receipts are <strong>ephemeral by design</strong>. They expire after a maximum of 24 hours and are permanently deleted by an automated cleanup process. There is no archive. Once expired, receipt data is gone.</p>

    <h2>Data We Don't Collect</h2>
    <ul>
      <li>No tracking cookies or analytics scripts</li>
      <li>No third-party advertising</li>
      <li>No selling or sharing of data with third parties</li>
      <li>No client-side JavaScript on any page</li>
    </ul>

    <h2>Third-Party Services</h2>
    <ul>
      <li><strong>Neon</strong> — PostgreSQL database hosting (receipt and key storage)</li>
      <li><strong>Vercel</strong> — application hosting and serverless compute</li>
      <li><strong>Resend</strong> — transactional email delivery for signup</li>
    </ul>

    <h2>Security</h2>
    <p>API keys are SHA-256 hashed before storage. All traffic is encrypted via TLS. Rate limiting is applied per-key and per-IP to prevent abuse.</p>

    <h2>Your Rights</h2>
    <p>You can request deletion of your account and associated data by emailing <a href="mailto:hello@proofslip.ai">hello@proofslip.ai</a>. Since receipts auto-expire, most data is already deleted within 24 hours of creation.</p>

    <h2>Contact</h2>
    <p><a href="mailto:hello@proofslip.ai">hello@proofslip.ai</a></p>

    <p style="margin-top: 3rem; color: #444;">
      <a href="/" style="color: #666;">← proofslip.ai</a>
    </p>
  </div>
</body>
</html>`
}
