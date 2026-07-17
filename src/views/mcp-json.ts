export function getMcpDiscovery(): object {
  return {
    schema_version: '1.0',
    name: 'ProofSlip',
    description:
      'ProofSlip creates provider-backed public release proofs from GitHub Actions. ' +
      'This MCP package currently exposes the separate legacy short-lived receipt API.',
    repository: 'https://github.com/proofslip/mcp-server',
    package: '@proofslip/mcp-server',
    install: 'npx -y @proofslip/mcp-server',
    runtime: 'node',
    transport: 'stdio',
    scope: 'legacy_receipt_api',
    primary_api: {
      schema_version: 'release-proof/v1',
      create: 'POST https://proofslip.ai/v1/proofs/releases/github-actions',
      fetch: 'GET https://proofslip.ai/v1/proofs/{proof_id}',
      auth: 'GitHub Actions OIDC; no ProofSlip API key',
      note: 'Release-proof creation is not currently an MCP tool.',
    },
    env: [
      {
        name: 'PROOFSLIP_API_KEY',
        description: 'Your ProofSlip API key (starts with ak_). Get one free at POST /v1/auth/signup or via the signup tool. Required for create_receipt; verify_receipt, check_status, and signup work without it.',
        required: false,
      },
    ],
    tools: [
      {
        name: 'create_receipt',
        description:
          'Create a verifiable receipt when something happens. ' +
          'Types: action (completed event), approval (gate on decision), ' +
          'handshake (agent coordination), resume (continuation bookmark), failure (error record).',
        input_schema: {
          type: 'object',
          required: ['type', 'status', 'summary'],
          properties: {
            type: { type: 'string', enum: ['action', 'approval', 'handshake', 'resume', 'failure'] },
            status: { type: 'string' },
            summary: { type: 'string', maxLength: 280 },
            payload: { type: 'object' },
            expires_in: { type: 'integer', minimum: 60, maximum: 86400 },
            idempotency_key: { type: 'string' },
          },
        },
      },
      {
        name: 'verify_receipt',
        description: 'Verify a receipt and retrieve its full data. Returns validity, status, payload, and expiry.',
        input_schema: {
          type: 'object',
          required: ['receipt_id'],
          properties: {
            receipt_id: { type: 'string', description: 'Receipt ID (starts with rct_)' },
          },
        },
      },
      {
        name: 'check_status',
        description: 'Lightweight status poll. Returns only status and terminal flag — use for polling loops.',
        input_schema: {
          type: 'object',
          required: ['receipt_id'],
          properties: {
            receipt_id: { type: 'string', description: 'Receipt ID (starts with rct_)' },
          },
        },
      },
      {
        name: 'signup',
        description:
          'Get a free ProofSlip API key. Returns the key directly — save it immediately, it cannot be retrieved later. ' +
          'Only needed once; afterwards set PROOFSLIP_API_KEY to use create_receipt.',
        input_schema: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', description: 'Your email address' },
          },
        },
      },
    ],
    api: {
      base_url: 'https://proofslip.ai',
      openapi: 'https://proofslip.ai/.well-known/openapi.json',
      docs: 'https://proofslip.ai/docs',
      llms_txt: 'https://proofslip.ai/llms.txt',
    },
  };
}
