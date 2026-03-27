import { FONT_FACE_CSS } from './font.js'

export function renderDevConsole(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>ProofSlip Dev Console</title>
  <style>
    ${FONT_FACE_CSS}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Departure Mono', monospace;
      font-size: 14px;
      background: #0a0a0a;
      color: #e0e0e0;
      min-height: 100vh;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .console {
      max-width: 720px;
      width: 100%;
    }
    h1 {
      font-size: 1.2rem;
      font-weight: normal;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      font-size: 0.75rem;
      color: #555;
      margin-bottom: 2rem;
    }

    /* Config section */
    .config {
      background: #111;
      border: 1px solid #222;
      padding: 1.25rem;
      margin-bottom: 2rem;
    }
    .config-title {
      font-size: 0.75rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 1rem;
    }
    .field {
      margin-bottom: 0.75rem;
    }
    .field:last-child { margin-bottom: 0; }
    label {
      display: block;
      font-size: 0.7rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.3rem;
    }
    input, select {
      width: 100%;
      background: #0a0a0a;
      border: 1px solid #222;
      color: #e0e0e0;
      font-family: 'Departure Mono', monospace;
      font-size: 0.8rem;
      padding: 0.5rem;
    }
    input:focus, select:focus {
      outline: none;
      border-color: #444;
    }
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    /* Preset buttons */
    .presets {
      margin-bottom: 2rem;
    }
    .presets-title {
      font-size: 0.75rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 0.5rem;
    }
    .preset-btn {
      background: #111;
      border: 1px solid #222;
      color: #e0e0e0;
      font-family: 'Departure Mono', monospace;
      font-size: 0.75rem;
      padding: 0.75rem 0.5rem;
      cursor: pointer;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .preset-btn:hover {
      border-color: #16a34a;
      color: #16a34a;
    }
    .preset-btn:active {
      background: #16a34a;
      color: #0a0a0a;
    }

    /* Fire button */
    .fire-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .fire-btn {
      flex: 1;
      background: #fafaf5;
      color: #0a0a0a;
      border: none;
      font-family: 'Departure Mono', monospace;
      font-size: 0.85rem;
      padding: 0.75rem;
      cursor: pointer;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .fire-btn:hover { background: #e8e8e0; }
    .fire-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .audience-toggle {
      background: #111;
      border: 1px solid #222;
      color: #666;
      font-family: 'Departure Mono', monospace;
      font-size: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      letter-spacing: 0.05em;
    }
    .audience-toggle.active {
      border-color: #16a34a;
      color: #16a34a;
    }

    /* Results */
    .results-title {
      font-size: 0.75rem;
      color: #444;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 0.75rem;
    }
    .result-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .result-card {
      background: #111;
      border: 1px solid #222;
      padding: 1rem;
    }
    .result-card.error {
      border-color: #a85454;
    }
    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .result-type {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .result-status {
      font-size: 0.7rem;
      color: #16a34a;
    }
    .result-status.terminal { color: #16a34a; }
    .result-status.pending { color: #d4a843; }
    .result-summary {
      font-size: 0.8rem;
      color: #888;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .result-links {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .result-links a {
      font-size: 0.7rem;
      color: #16a34a;
      text-decoration: none;
      letter-spacing: 0.05em;
    }
    .result-links a:hover {
      text-decoration: underline;
    }
    .result-id {
      font-size: 0.65rem;
      color: #444;
    }
    .result-error {
      font-size: 0.8rem;
      color: #a85454;
    }
    .result-time {
      font-size: 0.65rem;
      color: #444;
      margin-top: 0.3rem;
    }
    .empty-state {
      font-size: 0.8rem;
      color: #333;
      text-align: center;
      padding: 2rem;
      border: 1px dashed #1a1a1a;
    }

    @media (max-width: 640px) {
      body { padding: 1rem 0.75rem; }
      .preset-grid { grid-template-columns: repeat(2, 1fr); }
      .row-2 { grid-template-columns: 1fr; }
      .fire-row { flex-direction: column; }
    }
  </style>
</head>
<body>
  <div class="console">
    <h1>Dev Console</h1>
    <div class="subtitle">Generate test receipts. Private — not indexed.</div>

    <!-- Config -->
    <div class="config">
      <div class="config-title">Agent Config</div>
      <div class="field">
        <label>API Key</label>
        <input type="password" id="apiKey" placeholder="ak_..." autocomplete="off">
      </div>
      <div class="row-2">
        <div class="field">
          <label>Agent ID</label>
          <input type="text" id="agentId" value="test-agent" placeholder="e.g. billing-bot">
        </div>
        <div class="field">
          <label>Workflow ID</label>
          <input type="text" id="workflowId" value="dev-test" placeholder="e.g. onboarding-v2">
        </div>
      </div>
    </div>

    <!-- Presets -->
    <div class="presets">
      <div class="presets-title">Quick Presets</div>
      <div class="preset-grid">
        <button class="preset-btn" onclick="loadPreset('action-success')">Action<br>success</button>
        <button class="preset-btn" onclick="loadPreset('approval-pending')">Approval<br>pending</button>
        <button class="preset-btn" onclick="loadPreset('approval-approved')">Approval<br>approved</button>
        <button class="preset-btn" onclick="loadPreset('handshake-connected')">Handshake<br>connected</button>
        <button class="preset-btn" onclick="loadPreset('resume-cleared')">Resume<br>cleared</button>
        <button class="preset-btn" onclick="loadPreset('failure-failed')">Failure<br>failed</button>
      </div>
    </div>

    <!-- Custom fields -->
    <div class="config">
      <div class="config-title">Receipt Fields</div>
      <div class="row-2">
        <div class="field">
          <label>Type</label>
          <select id="receiptType">
            <option value="action">action</option>
            <option value="approval">approval</option>
            <option value="handshake">handshake</option>
            <option value="resume">resume</option>
            <option value="failure">failure</option>
          </select>
        </div>
        <div class="field">
          <label>Status</label>
          <input type="text" id="receiptStatus" value="success" placeholder="e.g. success, pending">
        </div>
      </div>
      <div class="field">
        <label>Summary (280 chars max)</label>
        <input type="text" id="receiptSummary" value="Test receipt from dev console" maxlength="280">
      </div>
      <div class="field">
        <label>TTL (seconds, 60-86400)</label>
        <input type="number" id="receiptTtl" value="3600" min="60" max="86400">
      </div>
    </div>

    <!-- Fire -->
    <div class="fire-row">
      <button class="fire-btn" id="fireBtn" onclick="fireReceipt()">Create Receipt</button>
      <button class="audience-toggle" id="audienceBtn" onclick="toggleAudience()">audience: agent</button>
    </div>

    <!-- Results -->
    <div>
      <div class="results-title">Results</div>
      <div class="result-list" id="results">
        <div class="empty-state">No receipts yet. Hit a preset or create one.</div>
      </div>
    </div>
  </div>

  <script>
    let audience = null;

    const PRESETS = {
      'action-success': {
        type: 'action', status: 'success',
        summary: 'Refund of $42.00 issued to customer #8812'
      },
      'approval-pending': {
        type: 'approval', status: 'pending',
        summary: 'Transfer $5,000 to vendor account #4421 — awaiting human approval'
      },
      'approval-approved': {
        type: 'approval', status: 'approved',
        summary: 'Deployment to production approved by oncall engineer'
      },
      'handshake-connected': {
        type: 'handshake', status: 'connected',
        summary: 'Data pipeline source and sink confirmed mutual readiness'
      },
      'resume-cleared': {
        type: 'resume', status: 'cleared',
        summary: 'Canary deploy passed — pipeline cleared to continue rollout'
      },
      'failure-failed': {
        type: 'failure', status: 'failed',
        summary: 'Payment processor returned error 502 — gateway timeout on charge attempt'
      }
    };

    function loadPreset(key) {
      const p = PRESETS[key];
      document.getElementById('receiptType').value = p.type;
      document.getElementById('receiptStatus').value = p.status;
      document.getElementById('receiptSummary').value = p.summary;
    }

    function toggleAudience() {
      const btn = document.getElementById('audienceBtn');
      if (audience === 'human') {
        audience = null;
        btn.textContent = 'audience: agent';
        btn.classList.remove('active');
      } else {
        audience = 'human';
        btn.textContent = 'audience: human';
        btn.classList.add('active');
      }
    }

    async function fireReceipt() {
      const apiKey = document.getElementById('apiKey').value.trim();
      if (!apiKey) { alert('Enter your API key first.'); return; }

      const btn = document.getElementById('fireBtn');
      btn.disabled = true;
      btn.textContent = 'Creating...';

      const body = {
        type: document.getElementById('receiptType').value,
        status: document.getElementById('receiptStatus').value,
        summary: document.getElementById('receiptSummary').value,
        expires_in: parseInt(document.getElementById('receiptTtl').value) || 3600,
        ref: {
          agent_id: document.getElementById('agentId').value || 'test-agent',
          workflow_id: document.getElementById('workflowId').value || 'dev-test'
        }
      };
      if (audience === 'human') body.audience = 'human';

      try {
        const res = await fetch('/v1/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey
          },
          body: JSON.stringify(body)
        });
        const data = await res.json();

        const container = document.getElementById('results');
        const empty = container.querySelector('.empty-state');
        if (empty) empty.remove();

        if (!res.ok) {
          container.insertAdjacentHTML('afterbegin',
            '<div class="result-card error">' +
              '<div class="result-error">' + (data.error || 'unknown_error') + ': ' + (data.message || 'Request failed') + '</div>' +
              '<div class="result-time">' + new Date().toLocaleTimeString() + '</div>' +
            '</div>'
          );
        } else {
          const terminal = data.is_terminal;
          const statusClass = terminal ? 'terminal' : 'pending';
          const statusLabel = terminal ? 'TERMINAL' : 'POLLING (' + data.next_poll_after_seconds + 's)';
          const audienceTag = data.audience ? ' &middot; audience: human' : '';

          container.insertAdjacentHTML('afterbegin',
            '<div class="result-card">' +
              '<div class="result-header">' +
                '<span class="result-type">' + data.type + ' / ' + data.status + audienceTag + '</span>' +
                '<span class="result-status ' + statusClass + '">' + statusLabel + '</span>' +
              '</div>' +
              '<div class="result-summary">' + data.summary + '</div>' +
              '<div class="result-links">' +
                '<a href="' + data.verify_url + '" target="_blank">View Receipt</a>' +
                '<a href="' + data.verify_url + '?format=json" target="_blank">JSON</a>' +
                '<a href="/v1/receipts/' + data.receipt_id + '/status" target="_blank">Poll Status</a>' +
              '</div>' +
              '<div class="result-id">' + data.receipt_id + '</div>' +
              '<div class="result-time">expires ' + new Date(data.expires_at).toLocaleString() + '</div>' +
            '</div>'
          );
        }
      } catch (err) {
        const container = document.getElementById('results');
        container.insertAdjacentHTML('afterbegin',
          '<div class="result-card error"><div class="result-error">Network error: ' + err.message + '</div></div>'
        );
      } finally {
        btn.disabled = false;
        btn.textContent = 'Create Receipt';
      }
    }
  </script>
</body>
</html>`
}
