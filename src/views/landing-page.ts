import { FONT_FACE_CSS } from './font.js'

export function renderLandingPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ProofSlip — Verify What Your Coding Agent Shipped</title>
  <meta name="description" content="ProofSlip turns GitHub Actions identity and release context into a portable proof that another coding agent or human can inspect.">
  <meta name="keywords" content="coding agent release verification, GitHub Actions OIDC, AI coding agents, release proof, deployment evidence, CI verification">
  <meta name="robots" content="index, follow">
  <meta name="author" content="Z13 Labs">
  <link rel="canonical" href="https://proofslip.ai">
  <meta property="og:title" content="Your coding agent says it shipped. Check the slip.">
  <meta property="og:description" content="Provider-backed release proof for coding agents, built on GitHub Actions identity.">
  <meta property="og:image" content="https://proofslip.ai/og-image.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="https://proofslip.ai">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="ProofSlip">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Your coding agent says it shipped. Check the slip.">
  <meta name="twitter:description" content="Provider-backed release proof for coding agents, built on GitHub Actions identity.">
  <meta name="twitter:image" content="https://proofslip.ai/og-image.png">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%23090909'/><path d='M25 15h50v70H25z' fill='%23f2f0e8'/><path d='M25 78l7 7 7-7 7 7 7-7 7 7 7-7 8 7V15H25z' fill='%23f2f0e8'/><text x='50' y='61' text-anchor='middle' font-size='42' font-family='monospace' fill='%23090909'>P</text></svg>">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ProofSlip",
    "description": "Provider-backed release proof for coding agents, built on GitHub Actions identity.",
    "url": "https://proofslip.ai",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "creator": {
      "@type": "Organization",
      "name": "Z13 Labs",
      "url": "https://z13labs.com"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  }
  </script>
  <style>
    ${FONT_FACE_CSS}

    :root {
      --bg: #090909;
      --panel: #0f0f0f;
      --panel-raised: #141414;
      --line: #242424;
      --line-strong: #343434;
      --text: #f0eee7;
      --muted: #9a9a93;
      --dim: #777770;
      --green: #3ddc84;
      --green-dark: #123824;
      --amber: #e0b45b;
      --paper: #f1efe7;
      --ink: #171713;
      --paper-muted: #6d6c65;
      --max: 1180px;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      background:
        radial-gradient(circle at 72% 4%, rgba(61, 220, 132, 0.07), transparent 27rem),
        var(--bg);
      color: var(--text);
      font-family: 'Departure Mono', monospace;
      font-size: 16px;
      line-height: 1.6;
    }

    a { color: inherit; }
    code, pre { font-family: 'Departure Mono', monospace; }
    ::selection { background: var(--green); color: #07150d; }

    .shell {
      width: min(calc(100% - 40px), var(--max));
      margin: 0 auto;
    }

    .site-header {
      min-height: 76px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      border-bottom: 1px solid var(--line);
    }

    .brand {
      display: inline-flex;
      align-items: center;
      gap: 0.7rem;
      text-decoration: none;
      letter-spacing: 0.14em;
      font-size: 0.86rem;
    }

    .brand-mark {
      width: 25px;
      height: 31px;
      display: grid;
      place-items: center;
      background: var(--paper);
      color: var(--ink);
      font-size: 0.75rem;
      clip-path: polygon(0 0, 100% 0, 100% 86%, 84% 100%, 67% 86%, 50% 100%, 33% 86%, 16% 100%, 0 86%);
    }

    .site-nav {
      display: flex;
      align-items: center;
      gap: 1.6rem;
    }

    .site-nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.72rem;
      letter-spacing: 0.05em;
    }

    .site-nav a:hover { color: var(--text); }

    .nav-cta {
      border: 1px solid var(--line-strong);
      padding: 0.48rem 0.72rem;
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.03fr) minmax(370px, 0.97fr);
      gap: clamp(3rem, 7vw, 7rem);
      align-items: center;
      min-height: 740px;
      padding: 6rem 0;
    }

    .eyebrow, .section-kicker {
      color: var(--green);
      font-size: 0.68rem;
      letter-spacing: 0.18em;
      text-transform: uppercase;
    }

    .hero h1 {
      max-width: 700px;
      margin: 1.4rem 0 1.5rem;
      font-size: clamp(2.6rem, 5.4vw, 5.35rem);
      line-height: 1.04;
      letter-spacing: -0.045em;
      font-weight: normal;
    }

    .hero-copy {
      max-width: 670px;
      color: var(--muted);
      font-size: clamp(0.9rem, 1.4vw, 1.04rem);
      line-height: 1.85;
    }

    .hero-copy strong { color: var(--text); font-weight: normal; }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-top: 2.2rem;
    }

    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 46px;
      padding: 0.7rem 1.05rem;
      border: 1px solid var(--line-strong);
      color: var(--text);
      text-decoration: none;
      font-size: 0.75rem;
    }

    .button-primary {
      border-color: var(--green);
      background: var(--green);
      color: #06120b;
    }

    .button:hover { transform: translateY(-1px); }
    .button-primary:hover { background: #53e394; }

    .hero-note {
      margin-top: 1rem;
      color: var(--dim);
      font-size: 0.68rem;
    }

    .proof-wrap { position: relative; }
    .proof-wrap::before {
      content: 'PROOF ANATOMY / ILLUSTRATIVE';
      position: absolute;
      z-index: -1;
      top: -2rem;
      right: -1rem;
      color: #242821;
      font-size: clamp(1.4rem, 2.5vw, 2.6rem);
      letter-spacing: 0.08em;
      white-space: nowrap;
    }

    .slip {
      position: relative;
      width: 100%;
      max-width: 510px;
      margin-left: auto;
      padding: 2rem 2rem 2.35rem;
      background: var(--paper);
      color: var(--ink);
      box-shadow: 0 32px 90px rgba(0, 0, 0, 0.34);
    }

    .slip::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: -10px;
      left: 0;
      height: 10px;
      background:
        linear-gradient(135deg, var(--paper) 50%, transparent 50%) 0 0 / 20px 10px,
        linear-gradient(225deg, var(--paper) 50%, transparent 50%) 10px 0 / 20px 10px;
    }

    .slip-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed #bbb9b0;
    }

    .slip-brand {
      font-size: 0.9rem;
      letter-spacing: 0.16em;
    }

    .slip-subtitle {
      margin-top: 0.18rem;
      color: var(--paper-muted);
      font-size: 0.59rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .status-badge {
      padding: 0.34rem 0.55rem;
      border: 1px solid #16884c;
      color: #126a3c;
      font-size: 0.58rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .slip-id {
      margin: 0.8rem 0 1.05rem;
      color: #8b8980;
      font-size: 0.62rem;
    }

    .proof-group {
      margin-top: 0.9rem;
      padding: 0.9rem;
      border: 1px solid #d4d1c7;
    }

    .proof-group.provider { border-left: 3px solid #16884c; }
    .proof-group.observed { border-left: 3px solid #b07d21; }
    .proof-group.submitted { border-left: 3px solid #85827a; }

    .proof-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 0.75rem;
      color: var(--paper-muted);
      font-size: 0.57rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .proof-label .source { letter-spacing: 0; text-transform: none; }

    .proof-row {
      display: grid;
      grid-template-columns: 7.6rem minmax(0, 1fr);
      gap: 0.75rem;
      padding: 0.24rem 0;
      font-size: 0.67rem;
    }

    .proof-row .key { color: var(--paper-muted); }
    .proof-row .value { text-align: right; overflow-wrap: anywhere; }
    .proof-row .value.ok { color: #126a3c; }

    .slip-disclaimer {
      margin: 1rem 0 0;
      padding-top: 0.9rem;
      border-top: 1px dashed #bbb9b0;
      color: var(--paper-muted);
      font-size: 0.57rem;
      line-height: 1.55;
    }

    .section {
      padding: 7rem 0;
      border-top: 1px solid var(--line);
    }

    .section-heading {
      max-width: 800px;
      margin: 0.9rem 0 1rem;
      font-size: clamp(1.9rem, 4vw, 3.4rem);
      line-height: 1.15;
      letter-spacing: -0.035em;
      font-weight: normal;
    }

    .section-intro {
      max-width: 700px;
      margin: 0;
      color: var(--muted);
      font-size: 0.88rem;
    }

    .evidence-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1px;
      margin-top: 3rem;
      background: var(--line);
      border: 1px solid var(--line);
    }

    .evidence-card {
      min-height: 270px;
      padding: 1.6rem;
      background: var(--panel);
    }

    .evidence-number { color: var(--dim); font-size: 0.62rem; }
    .evidence-title {
      margin: 2.2rem 0 0.6rem;
      font-size: 1rem;
      font-weight: normal;
    }
    .evidence-title.provider { color: var(--green); }
    .evidence-title.observed { color: var(--amber); }
    .evidence-title.submitted { color: #b3b3ad; }
    .evidence-card p { margin: 0; color: var(--muted); font-size: 0.76rem; }
    .evidence-card ul { margin: 1rem 0 0; padding: 0; list-style: none; }
    .evidence-card li {
      padding: 0.28rem 0 0.28rem 0.9rem;
      color: var(--dim);
      font-size: 0.67rem;
      position: relative;
    }
    .evidence-card li::before { content: '—'; position: absolute; left: 0; }

    .limits {
      display: grid;
      grid-template-columns: 0.72fr 1.28fr;
      gap: 4rem;
      align-items: start;
    }

    .limit-list {
      border-top: 1px solid var(--line);
    }

    .limit-item {
      display: grid;
      grid-template-columns: 2rem 1fr;
      gap: 1rem;
      padding: 1.1rem 0;
      border-bottom: 1px solid var(--line);
      color: var(--muted);
      font-size: 0.76rem;
    }

    .limit-mark { color: #a75757; }

    .steps {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-top: 3rem;
    }

    .step {
      min-height: 210px;
      padding: 1.5rem;
      border: 1px solid var(--line);
      background: var(--panel);
    }

    .step-number { color: var(--green); font-size: 0.65rem; }
    .step h3 { margin: 2.2rem 0 0.6rem; font-size: 1rem; font-weight: normal; }
    .step p { margin: 0; color: var(--muted); font-size: 0.75rem; }

    .quick-start-grid {
      display: grid;
      grid-template-columns: 0.68fr 1.32fr;
      gap: clamp(2rem, 6vw, 6rem);
      align-items: start;
      margin-top: 3rem;
    }

    .quick-notes {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .quick-note {
      padding: 1rem 0;
      border-bottom: 1px solid var(--line);
    }

    .quick-note strong {
      display: block;
      margin-bottom: 0.3rem;
      font-size: 0.75rem;
      font-weight: normal;
    }

    .quick-note span { color: var(--dim); font-size: 0.68rem; }

    .code-panel {
      border: 1px solid var(--line);
      background: #070707;
      min-width: 0;
    }

    .code-head {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--line);
      color: var(--dim);
      font-size: 0.62rem;
    }

    .code-head span:last-child { color: var(--green); }

    .code-panel pre {
      margin: 0;
      padding: 1.2rem;
      overflow-x: auto;
      color: #a6c694;
      font-size: 0.67rem;
      line-height: 1.8;
      white-space: pre;
    }

    .agent-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 3rem;
    }

    .agent-card {
      padding: 1.5rem;
      border: 1px solid var(--line);
      background: var(--panel);
    }

    .agent-card h3 { margin: 0 0 0.8rem; font-size: 0.9rem; font-weight: normal; }
    .agent-card p { margin: 0; color: var(--muted); font-size: 0.74rem; }
    .agent-command {
      margin-top: 1.2rem;
      padding: 0.9rem;
      overflow-x: auto;
      border: 1px solid var(--line);
      background: #080808;
      color: #a6c694;
      font-size: 0.66rem;
      white-space: nowrap;
    }

    .open-source {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--line);
      border: 1px solid var(--line);
    }

    .open-card {
      min-height: 240px;
      padding: 1.6rem;
      background: var(--panel);
      text-decoration: none;
    }

    .open-card:hover { background: var(--panel-raised); }
    .open-card .arrow { color: var(--green); }
    .open-card h3 { margin: 3rem 0 0.7rem; font-size: 1rem; font-weight: normal; }
    .open-card p { margin: 0; max-width: 430px; color: var(--muted); font-size: 0.73rem; }

    .legacy {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      padding: 1.3rem 0;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
    }

    .legacy p { margin: 0; color: var(--dim); font-size: 0.68rem; }
    .legacy strong { color: var(--muted); font-weight: normal; }
    .legacy a { color: var(--muted); font-size: 0.7rem; white-space: nowrap; }

    .site-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      min-height: 140px;
      color: var(--dim);
      font-size: 0.65rem;
    }

    .footer-links { display: flex; gap: 1.2rem; }
    .footer-links a { color: var(--dim); text-decoration: none; }
    .footer-links a:hover { color: var(--muted); }

    @media (max-width: 900px) {
      .hero { grid-template-columns: 1fr; min-height: auto; }
      .proof-wrap { max-width: 560px; }
      .slip { margin-left: 0; }
      .evidence-grid, .steps { grid-template-columns: 1fr; }
      .evidence-card, .step { min-height: auto; }
      .evidence-title, .step h3 { margin-top: 1.2rem; }
      .limits, .quick-start-grid { grid-template-columns: 1fr; gap: 2.5rem; }
    }

    @media (max-width: 680px) {
      .shell { width: min(calc(100% - 28px), var(--max)); }
      .site-header { min-height: 68px; }
      .site-nav a:not(.nav-cta) { display: none; }
      .hero { padding: 4.5rem 0 5rem; gap: 4.5rem; }
      .hero h1 { font-size: clamp(2.45rem, 12vw, 4.2rem); }
      .hero-actions { align-items: stretch; flex-direction: column; }
      .button { width: 100%; }
      .proof-wrap::before { right: 0; font-size: 1.2rem; }
      .slip { padding: 1.25rem 1.1rem 1.8rem; }
      .slip-head { flex-direction: column; }
      .proof-row { grid-template-columns: 1fr; gap: 0.1rem; }
      .proof-row .value { text-align: left; }
      .section { padding: 5rem 0; }
      .agent-grid, .open-source { grid-template-columns: 1fr; }
      .legacy, .site-footer { align-items: flex-start; flex-direction: column; }
      .legacy { padding: 1.3rem 0; }
      .site-footer { justify-content: center; padding: 2rem 0; }
      .footer-links { flex-wrap: wrap; }
    }

    @media (prefers-reduced-motion: reduce) {
      html { scroll-behavior: auto; }
      .button:hover { transform: none; }
    }
  </style>
</head>
<body>
  <header class="site-header shell">
    <a class="brand" href="/" aria-label="ProofSlip home">
      <span class="brand-mark" aria-hidden="true">P</span>
      <span>PROOFSLIP</span>
    </a>
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="#trust">Trust model</a>
      <a href="/docs">Legacy API</a>
      <a href="https://github.com/Johnny-Z13/proofslip" target="_blank" rel="noreferrer">GitHub</a>
      <a class="nav-cta" href="#quick-start">Add release proof</a>
    </nav>
  </header>

  <main>
    <section class="hero shell">
      <div>
        <div class="eyebrow">Release proof for coding agents</div>
        <h1>Your coding agent says it shipped. Check the slip.</h1>
        <p class="hero-copy">
          ProofSlip cryptographically verifies the <strong>GitHub Actions job identity</strong>
          behind a release claim and binds it to an exact repository, commit, workflow reference,
          and run. It then issues a portable proof another agent or human can inspect.
        </p>
        <div class="hero-actions">
          <a class="button button-primary" href="#quick-start">Add release proof</a>
          <a class="button" href="#proof-anatomy">Inspect a proof</a>
        </div>
        <div class="hero-note">GitHub Actions first · no ProofSlip account or API key · open source</div>
      </div>

      <div class="proof-wrap" id="proof-anatomy">
        <article class="slip" aria-label="Illustrative release proof">
          <div class="slip-head">
            <div>
              <div class="slip-brand">PROOFSLIP</div>
              <div class="slip-subtitle">release-proof/v1 · illustrative</div>
            </div>
            <div class="status-badge">Provider verified</div>
          </div>
          <div class="slip-id">prf_demo_7f3k9x2m</div>

          <section class="proof-group provider">
            <div class="proof-label">
              <span>Provider-verified</span>
              <span class="source">GitHub OIDC</span>
            </div>
            <div class="proof-row"><span class="key">Repository</span><span class="value">acme/checkout</span></div>
            <div class="proof-row"><span class="key">Commit</span><span class="value">8d21c9f…</span></div>
            <div class="proof-row"><span class="key">Ref</span><span class="value">refs/heads/main</span></div>
            <div class="proof-row"><span class="key">Workflow</span><span class="value">release.yml</span></div>
            <div class="proof-row"><span class="key">Run</span><span class="value">#1842 · attempt 1</span></div>
          </section>

          <section class="proof-group observed">
            <div class="proof-label">
              <span>ProofSlip-observed</span>
              <span class="source">HTTP check</span>
            </div>
            <div class="proof-row"><span class="key">URL</span><span class="value">app.acme.dev/health</span></div>
            <div class="proof-row"><span class="key">Observed</span><span class="value ok">HTTP 200 · 143ms</span></div>
          </section>

          <section class="proof-group submitted">
            <div class="proof-label">
              <span>Submitted, not verified</span>
              <span class="source">Workflow input</span>
            </div>
            <div class="proof-row"><span class="key">Environment</span><span class="value">production</span></div>
          </section>

          <p class="slip-disclaimer">
            This proves the GitHub job identity and recorded observations at issuance time.
            It does not prove that every test passed or that the observed deployment contains this commit.
          </p>
        </article>
      </div>
    </section>

    <section class="section shell" id="trust">
      <div class="section-kicker">Trust, with labels</div>
      <h2 class="section-heading">Every fact says where it came from.</h2>
      <p class="section-intro">
        A release proof is useful only if provider facts, ProofSlip observations, and workflow-supplied context never blur together.
      </p>

      <div class="evidence-grid">
        <article class="evidence-card">
          <div class="evidence-number">01 / GITHUB</div>
          <h3 class="evidence-title provider">Provider-verified</h3>
          <p>Claims cryptographically tied to a valid GitHub Actions OIDC token.</p>
          <ul>
            <li>repository and owner</li>
            <li>commit SHA and ref</li>
            <li>workflow, run, actor and event</li>
          </ul>
        </article>
        <article class="evidence-card">
          <div class="evidence-number">02 / PROOFSLIP</div>
          <h3 class="evidence-title observed">ProofSlip-observed</h3>
          <p>Facts ProofSlip measured directly at the moment the proof was issued.</p>
          <ul>
            <li>deployment URL requested</li>
            <li>HTTP status and latency</li>
            <li>observation timestamp</li>
          </ul>
        </article>
        <article class="evidence-card">
          <div class="evidence-number">03 / WORKFLOW</div>
          <h3 class="evidence-title submitted">Submitted, not verified</h3>
          <p>Useful labels supplied by the workflow, visibly separated from evidence.</p>
          <ul>
            <li>environment label</li>
            <li>release name</li>
            <li>human-readable context</li>
          </ul>
        </article>
      </div>
    </section>

    <section class="section shell">
      <div class="limits">
        <div>
          <div class="section-kicker">What it does not prove</div>
          <h2 class="section-heading">A proof with limits is stronger than a bigger claim.</h2>
        </div>
        <div class="limit-list">
          <div class="limit-item"><span class="limit-mark">×</span><span>GitHub OIDC does not prove that every test passed or that the entire workflow completed successfully.</span></div>
          <div class="limit-item"><span class="limit-mark">×</span><span>An HTTP 200 observation does not prove that the deployment contains the provider-verified commit.</span></div>
          <div class="limit-item"><span class="limit-mark">×</span><span>Labels submitted by the workflow do not become verified facts because they appear on the same slip.</span></div>
        </div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-kicker">The workflow</div>
      <h2 class="section-heading">One release. One portable proof.</h2>
      <div class="steps">
        <article class="step">
          <div class="step-number">01</div>
          <h3>Release from GitHub Actions</h3>
          <p>Your workflow requests a short-lived OIDC token scoped to the ProofSlip audience.</p>
        </article>
        <article class="step">
          <div class="step-number">02</div>
          <h3>Issue the slip</h3>
          <p>ProofSlip verifies GitHub's signature and required claims, records optional observations, and stores an immutable proof.</p>
        </article>
        <article class="step">
          <div class="step-number">03</div>
          <h3>Check before continuing</h3>
          <p>The next agent fetches the proof URL and sees the exact verified facts, limits, and expiry.</p>
        </article>
      </div>
    </section>

    <section class="section shell" id="quick-start">
      <div class="section-kicker">GitHub Actions quick start</div>
      <h2 class="section-heading">Add release proof after your release job.</h2>
      <p class="section-intro">
        The release workflow grants OIDC permission, requests a token for ProofSlip, and exchanges it for a public proof URL.
      </p>

      <div class="quick-start-grid">
        <div class="quick-notes">
          <div class="quick-note"><strong>No stored GitHub credential</strong><span>The OIDC token is short-lived, verified, and never persisted.</span></div>
          <div class="quick-note"><strong>No ProofSlip account</strong><span>The GitHub job identity is the credential for this narrow workflow.</span></div>
          <div class="quick-note"><strong>Public proof URL</strong><span>Add it to the Actions summary, release, task, or agent handoff.</span></div>
        </div>

        <div class="code-panel" aria-label="GitHub Actions workflow example">
          <div class="code-head"><span>.github/workflows/release.yml</span><span>release-proof/v1</span></div>
          <pre>permissions:
  contents: read
  id-token: write

steps:
  - name: Create ProofSlip release proof
    shell: bash
    run: |
      TOKEN="$(curl -fsS \\
        -H "Authorization: Bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \\
        "\${ACTIONS_ID_TOKEN_REQUEST_URL}&amp;audience=https%3A%2F%2Fproofslip.ai" \\
        | jq -r '.value')"

      RESPONSE="$(curl -fsS -X POST \\
        -H "Authorization: Bearer $TOKEN" \\
        -H "Content-Type: application/json" \\
        https://proofslip.ai/v1/proofs/releases/github-actions \\
        --data '{"idempotency_key":"\${{ github.repository }}:\${{ github.run_id }}:\${{ github.run_attempt }}"}')"

      PROOF_URL="$(jq -r '.proof_url' &lt;&lt;&lt; "$RESPONSE")"
      echo "### [View release proof]($PROOF_URL)" &gt;&gt; "$GITHUB_STEP_SUMMARY"</pre>
        </div>
      </div>
    </section>

    <section class="section shell">
      <div class="section-kicker">For the next agent</div>
      <h2 class="section-heading">Fetch the proof. Read the provenance. Decide.</h2>
      <div class="agent-grid">
        <article class="agent-card">
          <h3>Machine-readable</h3>
          <p>Public JSON exposes provider claims, ProofSlip observations, submitted context, validity, and expiry as separate fields.</p>
          <div class="agent-command">curl https://proofslip.ai/v1/proofs/prf_...</div>
        </article>
        <article class="agent-card">
          <h3>Human-readable</h3>
          <p>The same proof opens as an evidence page with direct links to the exact GitHub run and commit.</p>
          <div class="agent-command">https://proofslip.ai/proof/prf_...</div>
        </article>
      </div>
    </section>

    <section class="section shell">
      <div class="section-kicker">Open by default</div>
      <h2 class="section-heading">Inspect it. Self-host it. Improve it.</h2>
      <div class="open-source">
        <a class="open-card" href="https://github.com/Johnny-Z13/proofslip" target="_blank" rel="noreferrer">
          <span class="arrow">↗</span>
          <h3>Source on GitHub</h3>
          <p>The API, trust contract, tests, and workflow integration live in the open.</p>
        </a>
        <a class="open-card" href="https://github.com/Johnny-Z13/proofslip#development" target="_blank" rel="noreferrer">
          <span class="arrow">↗</span>
          <h3>Run your own</h3>
          <p>Hono, TypeScript, Postgres, and a small explicit trust boundary. No dashboard required.</p>
        </a>
      </div>
    </section>

    <aside class="legacy shell">
      <p><strong>Existing integration?</strong> The general receipt API, MCP server, SDK, and LangChain tools remain available and backward compatible.</p>
      <a href="/docs">Open legacy API docs →</a>
    </aside>
  </main>

  <footer class="site-footer shell">
    <span>PROOFSLIP · A Z13 LABS PROJECT</span>
    <div class="footer-links">
      <a href="/privacy">Privacy</a>
      <a href="/llms.txt">llms.txt</a>
      <a href="https://github.com/Johnny-Z13/proofslip" target="_blank" rel="noreferrer">GitHub</a>
      <a href="https://z13labs.com" target="_blank" rel="noreferrer">Z13 Labs</a>
    </div>
  </footer>
</body>
</html>`
}
