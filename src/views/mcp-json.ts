export function getMcpDiscovery(): object {
  return {
    schema_version: '1.0',
    name: 'ProofSlip',
    description:
      'Ephemeral verification receipts for AI agent workflows. ' +
      'Create short-lived proof tokens that agents verify before acting.',
    repository: 'https://github.com/proofslip/mcp-server',
    package: '@proofslip/mcp-server',
    install: 'npx -y @proofslip/mcp-server',
    runtime: 'node',
    transport: 'stdio',
    env: [
      {
        name: 'PROOFSLIP_API_KEY',
        description: 'Your ProofSlip API key (starts with ak_). Get one free at POST /v1/auth/signup.',
        required: true,
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
    ],
    api: {
      base_url: 'https://proofslip.ai',
      openapi: 'https://proofslip.ai/.well-known/openapi.json',
      docs: 'https://proofslip.ai/docs',
      llms_txt: 'https://proofslip.ai/llms.txt',
    },
  };
}
