import { FONT_FACE_CSS } from './font.js'
import { escapeHtml } from './verify-page.js'
import type { ProofResponse } from '../lib/proof-format.js'

/**
 * Human evidence view for a release proof.
 *
 * Trust boundary (do not merge these sections):
 *   1. provider-verified facts (GitHub Actions OIDC)
 *   2. ProofSlip observations
 *   3. submitted context — labelled "submitted, not verified"
 * Plus an explicit "what this does not prove" section.
 */
export function renderProofPage(proof: ProofResponse, options: { illustrative?: boolean } = {}): string {
  const illustrative = options.illustrative === true
  const statusLabel = illustrative ? 'ILLUSTRATIVE' : proof.is_expired ? 'EXPIRED' : 'VALID'
  const statusColor = illustrative ? '#b45309' : proof.is_expired ? '#b45309' : '#16a34a'
  const shortSha = proof.issuer.sha.slice(0, 12)

  const observationRows = proof.observations.length === 0
    ? '<div class="row"><span class="label">Observations</span><span class="value">none requested</span></div>'
    : (proof.observations as Array<Record<string, unknown>>).map((o) => {
        if (o.error) {
          return `<div class="row"><span class="label">HTTP check</span><span class="value">failed (${escapeHtml(String(o.reason ?? 'unknown'))})</span></div>
<div class="row"><span class="label">URL</span><span class="value">${escapeHtml(String(o.url ?? ''))}</span></div>`
        }
        return `<div class="row"><span class="label">HTTP check</span><span class="value">${escapeHtml(String(o.status_code))} in ${escapeHtml(String(o.response_time_ms))}ms</span></div>
<div class="row"><span class="label">URL</span><span class="value">${escapeHtml(String(o.url ?? ''))}</span></div>
<div class="row"><span class="label">Observed at</span><span class="value">${escapeHtml(String(o.observed_at ?? ''))}</span></div>`
      }).join('\n')

  const submittedRows = proof.submitted_context && Object.keys(proof.submitted_context).length > 0
    ? Object.entries(proof.submitted_context).map(([k, v]) =>
        `<div class="row"><span class="label">${escapeHtml(k)}</span><span class="value">${escapeHtml(v)}</span></div>`
      ).join('\n')
    : '<div class="row"><span class="value">none</span></div>'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${illustrative ? 'Illustrative release proof' : `Release proof ${escapeHtml(proof.proof_id)}`} | ProofSlip</title>
  <style>
    ${FONT_FACE_CSS}
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
    .receipt { background: #fafaf5; color: #1a1a1a; max-width: 480px; width: 100%; padding: 2rem 1.5rem; position: relative; }
    .receipt::after {
      content: ''; display: block; position: absolute; bottom: -8px; left: 0; right: 0; height: 8px;
      background: linear-gradient(135deg, #fafaf5 33.33%, transparent 33.33%) -8px 0,
                  linear-gradient(225deg, #fafaf5 33.33%, transparent 33.33%) -8px 0;
      background-size: 16px 8px;
    }
    .receipt-header { text-align: center; padding-bottom: 1rem; border-bottom: 1px dashed #ccc; margin-bottom: 1rem; }
    .receipt-header h1 { font-size: 1rem; font-weight: normal; letter-spacing: 0.15em; text-transform: uppercase; }
    .status-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; border: 1px solid ${statusColor}; color: ${statusColor}; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .proof-id { text-align: center; font-size: 0.65rem; color: #999; margin-bottom: 1rem; }
    .example-note { margin-bottom: 1rem; padding: 0.65rem; border: 1px dashed #b45309; color: #8a5b14; font-size: 0.62rem; line-height: 1.5; text-align: center; }
    .section-title { font-size: 0.7rem; color: #555; text-transform: uppercase; letter-spacing: 0.08em; margin: 1.25rem 0 0.5rem; padding-top: 1rem; border-top: 1px dashed #ccc; }
    .section-note { font-size: 0.6rem; color: #999; margin-bottom: 0.5rem; line-height: 1.5; }
    .row { display: flex; justify-content: space-between; margin-bottom: 0.45rem; font-size: 0.75rem; line-height: 1.4; gap: 0.5rem; }
    .row .label { color: #888; text-transform: uppercase; font-size: 0.65rem; letter-spacing: 0.05em; flex-shrink: 0; }
    .row .value { text-align: right; word-break: break-all; }
    .row .value a { color: #1a1a1a; }
    .submitted { background: #f4f1e4; border: 1px dashed #c9b96a; padding: 0.75rem; margin-top: 0.25rem; }
    .not-proven { background: #f0f0ea; padding: 0.75rem; font-size: 0.65rem; line-height: 1.6; color: #555; margin-top: 0.25rem; }
    .receipt-footer { text-align: center; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px dashed #ccc; }
    .receipt-footer a { color: #888; text-decoration: none; font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .receipt-footer a:hover { color: #1a1a1a; }
    .receipt-footer .tagline { font-size: 0.6rem; color: #bbb; margin-top: 0.25rem; }
    .install-hint { max-width: 480px; width: 100%; margin-top: 1.5rem; text-align: center; font-size: 0.6rem; color: #555; line-height: 1.8; }
    .install-hint code { color: #7c9a5e; background: #111; padding: 0.15rem 0.4rem; }
    .json-link { margin-top: 0.75rem; }
    .json-link a { color: #666; font-size: 0.65rem; }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="receipt-header">
      <h1>ProofSlip · Release Proof</h1>
      <div class="status-badge">${statusLabel}</div>
    </div>
    <div class="proof-id">${escapeHtml(proof.proof_id)} · ${escapeHtml(proof.schema_version)}</div>
    ${illustrative ? '<div class="example-note">Example only. No provider token was verified and this page is not release evidence.</div>' : ''}

    <div class="section-title">Provider-verified · GitHub Actions OIDC</div>
    <div class="section-note">Verified by ProofSlip against GitHub's signing keys. Proves the identity and execution context of the workflow job that requested the token.</div>
    <div class="row"><span class="label">Repository</span><span class="value">${illustrative ? escapeHtml(proof.issuer.repository) : `<a href="https://github.com/${escapeHtml(proof.issuer.repository)}" rel="noopener">${escapeHtml(proof.issuer.repository)}</a>`}</span></div>
    <div class="row"><span class="label">Commit</span><span class="value">${illustrative ? escapeHtml(shortSha) : `<a href="${escapeHtml(proof.issuer.commit_url)}" rel="noopener">${escapeHtml(shortSha)}</a>`}</span></div>
    <div class="row"><span class="label">Ref</span><span class="value">${escapeHtml(proof.issuer.ref)}</span></div>
    <div class="row"><span class="label">Workflow run</span><span class="value">${illustrative ? `#${escapeHtml(proof.issuer.run_id)} (attempt ${proof.issuer.run_attempt})` : `<a href="${escapeHtml(proof.issuer.run_url)}" rel="noopener">#${escapeHtml(proof.issuer.run_id)} (attempt ${proof.issuer.run_attempt})</a>`}</span></div>
    <div class="row"><span class="label">Workflow</span><span class="value">${escapeHtml(proof.issuer.workflow_ref)}</span></div>
    <div class="row"><span class="label">Actor</span><span class="value">${escapeHtml(proof.issuer.actor)}</span></div>
    <div class="row"><span class="label">Event</span><span class="value">${escapeHtml(proof.issuer.event_name)}</span></div>
    <div class="row"><span class="label">Visibility</span><span class="value">${escapeHtml(proof.issuer.repository_visibility)}</span></div>

    <div class="section-title">Observed by ProofSlip</div>
    <div class="section-note">Independently observed by ProofSlip at issuance time.</div>
    ${observationRows}

    <div class="section-title">Submitted context — not verified</div>
    <div class="section-note">Supplied by the workflow. ProofSlip did not verify any of it.</div>
    <div class="submitted">
      ${submittedRows}
    </div>

    <div class="section-title">What this does not prove</div>
    <div class="not-proven">
      This proof does not show that all tests passed, that the whole workflow succeeded,
      or that any deployment contains commit ${escapeHtml(shortSha)}. It proves which
      repository, commit, workflow, and run requested the token${proof.observations.length > 0 ? ', plus the HTTP status ProofSlip observed above' : ''}.
    </div>

    <div class="row" style="margin-top:1rem"><span class="label">Issued</span><span class="value">${new Date(proof.issued_at).toUTCString()}</span></div>
    <div class="row"><span class="label">Expires</span><span class="value">${new Date(proof.expires_at).toUTCString()}</span></div>

    <div class="receipt-footer">
      <a href="/">proofslip.ai</a>
      <div class="tagline">your coding agent says it shipped. check the slip.</div>
      <div class="json-link">${illustrative ? '<a href="/docs">read the release-proof contract</a>' : `<a href="/v1/proofs/${escapeHtml(proof.proof_id)}">machine-readable JSON</a>`}</div>
    </div>
  </div>

  <div class="install-hint">
    Add or verify release proof with your coding agent:<br>
    <code>npx skills add Johnny-Z13/proofslip --skill proofslip-release-proof</code>
  </div>
</body>
</html>`
}
