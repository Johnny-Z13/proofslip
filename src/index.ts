import { Hono } from 'hono'
import { receiptsRouter } from './routes/receipts.js'
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
import { cors, requestId, bodyLimit, securityHeaders } from './middleware/security.js'
import { requestLogger } from './middleware/logger.js'

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
  <url><loc>https://proofslip.ai/llms.txt</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://proofslip.ai/.well-known/openapi.json</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://proofslip.ai/.well-known/agent.json</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://proofslip.ai/.well-known/mcp.json</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://proofslip.ai/llms-full.txt</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://proofslip.ai/docs</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
</urlset>`)
})
app.get('/robots.txt', (c) => {
  return c.text(
    'User-agent: *\nAllow: /\n\n' +
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
  return c.body(renderLlmsTxt())
})
app.get('/llms-full.txt', (c) => {
  c.header('Content-Type', 'text/plain; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=86400')
  return c.body(renderLlmsFullTxt())
})
app.get('/docs', (c) => c.html(renderDocsPage()))
app.get('/.well-known/openapi.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  return c.json(getOpenApiSpec())
})
app.get('/.well-known/mcp.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  return c.json(getMcpDiscovery())
})
app.get('/.well-known/agent.json', (c) => {
  c.header('Cache-Control', 'public, max-age=86400')
  return c.json({
    name: 'ProofSlip',
    description:
      'Ephemeral verification receipts for AI agent workflows. ' +
      'Create short-lived proof tokens that agents verify before acting. ' +
      'Prevents duplicate actions, verifies approvals, coordinates handshakes.',
    url: 'https://proofslip.ai',
    version: '1.0.0',
    capabilities: ['receipts', 'verification', 'polling'],
    protocol: 'openapi',
    api: {
      type: 'openapi',
      url: 'https://proofslip.ai/.well-known/openapi.json',
    },
    auth: {
      type: 'bearer',
      signup_url: 'https://proofslip.ai/v1/auth/signup',
      instructions: 'POST /v1/auth/signup with {"email": "you@example.com", "source": "api"} to get a free API key.',
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
  return c.json({
    schema_version: 'v1',
    name_for_human: 'ProofSlip',
    name_for_model: 'proofslip',
    description_for_human: 'Ephemeral verification receipts for AI agent workflows.',
    description_for_model:
      'Create, verify, and poll short-lived proof receipts that agents check before acting. ' +
      'Use this to prevent duplicate actions, verify approvals, coordinate handshakes between agents, ' +
      'and gate workflows on fresh state. Receipts expire after 24 hours.',
    auth: { type: 'service_http', authorization_type: 'bearer' },
    api: { type: 'openapi', url: 'https://proofslip.ai/.well-known/openapi.json' },
    logo_url: 'https://proofslip.ai/og-image.png',
    contact_email: 'hello@proofslip.ai',
    legal_info_url: 'https://proofslip.ai',
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
    return c.json({ error: 'not_found', message: 'Route not found.' }, 404)
  }
  return c.html(renderDevConsole())
})
app.route('/v1/receipts', statusRouter)
app.route('/v1/receipts', receiptsRouter)
app.route('/v1/verify', verifyRouter)
app.route('/verify', verifyRouter)
app.route('/v1/auth', authRouter)
app.route('/cron', cronRouter)

// ─── 404 fallback ────────────────────────────────────────────────
app.notFound((c) => {
  return c.json({ error: 'not_found', message: 'Route not found.' }, 404)
})

export default app
