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
