import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
import { proofsRouter, proofPageRouter } from './routes/proofs.js'
import { verifyRouter } from './routes/verify.js'
import { authRouter } from './routes/auth.js'
import { cronRouter } from './routes/cron.js'
import { statusRouter } from './routes/status.js'
import { renderLandingPage } from './views/landing-page.js'
import { OG_IMAGE_PNG } from './views/og-image.js'
import { renderDevConsole } from './views/dev-console.js'
import { renderLlmsTxt } from './views/llms-txt.js'
import { renderLlmsFullTxt } from './views/llms-full-txt.js'
import { getOpenApiSpec } from './views/openapi.js'
import { getMcpDiscovery } from './views/mcp-json.js'
import { renderDocsPage } from './views/docs-page.js'
import { renderPrivacyPage } from './views/privacy-page.js'
import { renderProofPage } from './views/proof-page.js'
import { cors, requestId, bodyLimit, securityHeaders } from './middleware/security.js'
import { requestLogger } from './middleware/logger.js'
import { errorResponse } from './lib/errors.js'

const app = new Hono()

// ─── Global middleware (order matters) ───────────────────────────
app.use('*', cors)
app.use('*', securityHeaders)
app.use('*', requestId)
app.use('*', bodyLimit(16_384)) // 16KB max body
app.use('*', requestLogger)

// ─── Global error handler ────────────────────────────────────────
app.onError((err, c) => {
  const requestIdValue = (c as any).get('requestId') || null
  console.error(JSON.stringify({
    ts: new Date().toISOString(),
    error: err.message,
    request_id: requestIdValue,
    method: c.req.method,
    path: c.req.path,
  }))

  return c.json({
    error: 'internal_error',
    message: 'An unexpected error occurred. Please try again later.',
    request_id: requestIdValue,
  }, 500)
})

// ─── Routes ──────────────────────────────────────────────────────
app.get('/', (c) => c.html(renderLandingPage()))
app.get('/health', (c) => c.json({ status: 'ok' }))
app.get('/sitemap.xml', (c) => {
  c.header('Content-Type', 'application/xml')
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://proofslip.ai</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://proofslip.ai/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://proofslip.ai/privacy</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://proofslip.ai/example</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
</urlset>`)
})
app.get('/robots.txt', (c) => {
  return c.text(
    'User-agent: *\n' +
    'Allow: /\n' +
    'Disallow: /cron/\n' +
    'Disallow: /dev/\n' +
    'Disallow: /v1/\n\n' +
    'Sitemap: https://proofslip.ai/sitemap.xml\n\n' +
    '# AI agent discovery\n' +
    '# LLM context: /llms.txt\n' +
    '# OpenAPI spec: /.well-known/openapi.json\n' +
    '# OpenAI plugin: /.well-known/ai-plugin.json\n' +
    '# Agent protocol: /.well-known/agent.json\n' +
    '# MCP discovery: /.well-known/mcp.json\n' +
    '# Full LLM docs: /llms-full.txt\n' +
    '# API docs: /docs\n'
  )
})
app.get('/llms.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.body(renderLlmsTxt())
})
app.get('/llms-full.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.body(renderLlmsFullTxt())
})
app.get('/docs', (c) => c.html(renderDocsPage()))
app.get('/privacy', (c) => c.html(renderPrivacyPage()))
app.get('/example', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  return c.html(renderProofPage({
    proof_id: 'prf_example_7f3k9x2m',
    proof_url: 'https://proofslip.ai/example',
    schema_version: 'release-proof/v1',
    is_valid: false,
    is_expired: false,
    trust_level: 'provider_verified',
    verification_method: 'github_actions_oidc',
    issuer: {
      type: 'github_actions',
      repository: 'example/checkout',
      repository_id: '123456',
      repository_owner: 'example',
      repository_owner_id: '7890',
      repository_visibility: 'public',
      ref: 'refs/heads/main',
      sha: '8d21c9f0123456789abcdef0123456789abcdef0',
      workflow_ref: 'example/checkout/.github/workflows/release.yml@refs/heads/main',
      run_id: '1842',
      run_attempt: 1,
      actor: 'release-agent',
      event_name: 'push',
      subject: 'repo:example/checkout:ref:refs/heads/main',
      run_url: 'https://github.com/example/checkout/actions/runs/1842',
      commit_url: 'https://github.com/example/checkout/commit/8d21c9f0123456789abcdef0123456789abcdef0',
    },
    observations: [{
      type: 'http_status',
      url: 'https://app.example.com/health',
      status_code: 200,
      response_time_ms: 143,
      observed_at: '2026-07-19T12:00:00.000Z',
    }],
    submitted_context: { environment: 'production' },
    issued_at: '2026-07-19T12:00:00.000Z',
    expires_at: '2026-10-17T12:00:00.000Z',
  }, { illustrative: true }))
})
app.get('/.well-known/openapi.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.json(getOpenApiSpec())
})
app.get('/.well-known/mcp.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.json(getMcpDiscovery())
})
app.get('/.well-known/agent.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.json({
    name: 'ProofSlip',
    description:
      'Provider-backed public release proofs for GitHub Actions, with a legacy short-lived receipt API for agent workflows.',
    url: 'https://proofslip.ai',
    version: '1.0.0',
    capabilities: ['release_proofs', 'github_actions_oidc', 'public_verification', 'legacy_receipts', 'polling'],
    skill: {
      repository: 'https://github.com/Johnny-Z13/proofslip/tree/master/.agents/skills/proofslip-release-proof',
      install: 'npx skills add Johnny-Z13/proofslip --skill proofslip-release-proof',
      modes: ['verify_existing_proof', 'prepare_github_actions_integration'],
    },
    protocol: 'openapi',
    api: {
      type: 'openapi',
      url: 'https://proofslip.ai/.well-known/openapi.json',
    },
    auth: {
      type: 'per_operation',
      release_proofs: 'GitHub Actions OIDC bearer token; no ProofSlip account',
      legacy_receipts: 'ProofSlip bearer API key',
      signup_url: 'https://proofslip.ai/v1/auth/signup',
      instructions: 'Signup is required only for legacy receipt creation.',
    },
    mcp: {
      package: '@proofslip/mcp-server',
      install: 'npx -y @proofslip/mcp-server',
    },
    llms_txt: 'https://proofslip.ai/llms.txt',
    contact: 'hello@proofslip.ai',
  })
})
app.get('/.well-known/ai-plugin.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.json({
    schema_version: 'v1',
    name_for_human: 'ProofSlip',
    name_for_model: 'proofslip',
    description_for_human: 'Public GitHub Actions release proofs and legacy workflow receipts.',
    description_for_model:
      'Fetch public provider-backed release proofs created from GitHub Actions OIDC attestations. ' +
      'The issuer category proves job identity and execution context only; observations are ProofSlip-sourced and submitted_context is unverified. ' +
      'The authenticated legacy API creates and polls short-lived workflow receipts.',
    auth: { type: 'service_http', authorization_type: 'bearer' },
    api: { type: 'openapi', url: 'https://proofslip.ai/.well-known/openapi.json' },
    logo_url: 'https://proofslip.ai/og-image.png',
    contact_email: 'hello@proofslip.ai',
    legal_info_url: 'https://proofslip.ai/privacy',
  })
})
app.get('/og-image.png', (c) => {
  c.header('Content-Type', 'image/png')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.body(OG_IMAGE_PNG as unknown as ArrayBuffer)
})
app.get('/dev/console', (c) => {
  const secret = c.req.query('key')
  if (!secret || secret !== process.env.DEV_SECRET) {
    return errorResponse(c, 404, 'not_found', 'Route not found.')
  }
  return c.html(renderDevConsole())
})
app.route('/v1/receipts', statusRouter)
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/proofs', proofsRouter)
app.route('/proof', proofPageRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)
app.route('/v1/auth', authRouter)
app.route('/cron', cronRouter)

// ─── 404 fallback ────────────────────────────────────────────────
app.notFound((c) => {
  return errorResponse(c, 404, 'not_found', 'Route not found.')
})

export default app
