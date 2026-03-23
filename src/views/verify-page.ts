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
  <title>Receipt ${escapeHtml(receipt.id)} | ProofSlip</title>
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
