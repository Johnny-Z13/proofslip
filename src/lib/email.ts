/**
 * Send email via Resend API.
 * Returns true on success, false on failure (non-blocking).
 */
export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), error: 'RESEND_API_KEY not set', to: opts.to }))
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ProofSlip <noreply@proofslip.ai>',
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => 'unknown')
      console.error(JSON.stringify({ ts: new Date().toISOString(), error: 'resend_send_failed', status: res.status, body, to: opts.to }))
      return false
    }

    return true
  } catch (err) {
    console.error(JSON.stringify({ ts: new Date().toISOString(), error: 'resend_network_error', message: (err as Error).message, to: opts.to }))
    return false
  }
}

/**
 * Render the API key welcome email as HTML.
 * Styled like a ProofSlip receipt.
 */
export function renderWelcomeEmail(apiKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Courier New',Courier,monospace;">
  <div style="max-width:480px;margin:2rem auto;padding:0 1rem;">

    <div style="background:#fafaf5;color:#1a1a1a;padding:2rem 1.5rem;">
      <div style="text-align:center;padding-bottom:1rem;border-bottom:1px dashed #ccc;margin-bottom:1rem;">
        <div style="font-size:1rem;letter-spacing:0.15em;text-transform:uppercase;">ProofSlip</div>
        <div style="display:inline-block;margin-top:0.5rem;padding:0.25rem 0.75rem;border:1px solid #16a34a;color:#16a34a;font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;">API Key Issued</div>
      </div>

      <div style="margin:1rem 0;padding:0.75rem;background:#f0f0ea;font-size:0.85rem;line-height:1.5;">
        Your API key is ready. Save it somewhere safe — it cannot be retrieved later.
      </div>

      <div style="margin:1rem 0;padding:1rem;background:#111;color:#16a34a;font-size:0.8rem;word-break:break-all;line-height:1.6;font-family:'Courier New',Courier,monospace;">
        ${apiKey}
      </div>

      <div style="border-top:1px dashed #ccc;padding-top:1rem;margin-top:1rem;">
        <div style="font-size:0.7rem;color:#888;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:0.5rem;">Quick start</div>
        <div style="background:#f0f0ea;padding:0.75rem;font-size:0.7rem;line-height:1.6;overflow-x:auto;font-family:'Courier New',Courier,monospace;">
curl -X POST https://proofslip.ai/v1/receipts \\<br>
&nbsp;&nbsp;-H "Authorization: Bearer ${apiKey}" \\<br>
&nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
&nbsp;&nbsp;-d '{"type":"action","status":"success","summary":"My first receipt"}'
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;padding-top:1rem;border-top:1px dashed #ccc;">
        <a href="https://proofslip.ai" style="color:#888;text-decoration:none;font-size:0.65rem;letter-spacing:0.1em;text-transform:uppercase;">proofslip.ai</a>
        <div style="font-size:0.6rem;color:#bbb;margin-top:0.25rem;">ephemeral verification for agent workflows</div>
      </div>
    </div>

    <div style="text-align:center;margin-top:1rem;font-size:0.55rem;color:#444;line-height:1.6;">
      You received this because you signed up for a ProofSlip API key.<br>
      receipts expire, trust compounds.
    </div>

  </div>
</body>
</html>`
}
