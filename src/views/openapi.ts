export function getOpenApiSpec(): object {
  const errorContent = {
    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'ProofSlip API',
      version: '1.1.0',
      description:
        'Provider-backed release proofs for GitHub Actions, plus the legacy short-lived receipt API. ' +
        'Release proofs verify workflow job identity and execution context through GitHub OIDC; they do not prove that tests passed or that a deployment contains a commit.',
      contact: { url: 'https://proofslip.ai', email: 'hello@proofslip.ai' },
    },
    servers: [{ url: 'https://proofslip.ai' }],
    tags: [
      { name: 'Release proofs', description: 'Provider-backed, public evidence from GitHub Actions.' },
      { name: 'Legacy receipts', description: 'General-purpose ephemeral workflow receipts.' },
      { name: 'Account', description: 'API-key signup for the legacy receipt API.' },
    ],
    paths: {
      '/v1/proofs/releases/github-actions': {
        post: {
          tags: ['Release proofs'],
          operationId: 'createGitHubActionsReleaseProof',
          summary: 'Create a GitHub Actions release proof',
          description:
            'Verifies a GitHub Actions OIDC token with audience https://proofslip.ai and creates a public, read-only proof. ' +
            'No ProofSlip account or API key is required. The optional deployment check is a separate ProofSlip observation, not a provider-verified claim.',
          security: [{ githubOidc: [] }],
          requestBody: {
            required: false,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateReleaseProofRequest' } },
            },
          },
          responses: {
            '201': {
              description: 'Proof created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ReleaseProof' } } },
            },
            '200': {
              description: 'Identical token replay or idempotent retry; the existing proof is returned',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ReleaseProof' } } },
            },
            '400': { description: 'Validation error or unsupported issuer', content: errorContent },
            '401': { description: 'Missing or invalid GitHub Actions attestation', content: errorContent },
            '409': { description: 'Token replay or idempotency conflict with different content', content: errorContent },
            '413': { description: 'Request body exceeds 16KB', content: errorContent },
            '429': { description: 'Rate limited (30 requests/min per IP)', content: errorContent },
          },
        },
      },
      '/v1/proofs/{proofId}': {
        get: {
          tags: ['Release proofs'],
          operationId: 'getReleaseProof',
          summary: 'Fetch a public release proof',
          description:
            'Returns the immutable proof as JSON. Proofs have a 90-day validity window. Expired proofs remain inspectable and return HTTP 410 with the full record.',
          security: [],
          parameters: [
            {
              name: 'proofId',
              in: 'path',
              required: true,
              schema: { type: 'string', pattern: '^prf_' },
              description: 'Proof ID (starts with prf_)',
            },
          ],
          responses: {
            '200': {
              description: 'Proof found within its validity window',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ReleaseProof' } } },
            },
            '410': {
              description: 'Proof expired; full record returned with is_expired=true',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ReleaseProof' } } },
            },
            '404': { description: 'Proof not found', content: errorContent },
            '429': { description: 'Rate limited', content: errorContent },
          },
        },
      },
      '/v1/receipts': {
        post: {
          tags: ['Legacy receipts'],
          operationId: 'createReceipt',
          summary: 'Create a legacy workflow receipt',
          description: 'Issue a general-purpose receipt. Receipts expire after 24 hours by default.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreateReceiptRequest' } },
            },
          },
          responses: {
            '201': {
              description: 'Receipt created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateReceiptResponse' } } },
            },
            '400': { description: 'Validation error', content: errorContent },
            '401': { description: 'Missing or invalid API key', content: errorContent },
            '409': { description: 'Idempotency conflict', content: errorContent },
            '429': { description: 'Rate limited (60 requests/min per API key)', content: errorContent },
          },
        },
      },
      '/v1/verify/{receiptId}': {
        get: {
          tags: ['Legacy receipts'],
          operationId: 'verifyReceipt',
          summary: 'Verify a legacy receipt',
          description: 'Returns full receipt data. No authentication required.',
          security: [],
          parameters: [
            {
              name: 'receiptId',
              in: 'path',
              required: true,
              schema: { type: 'string', pattern: '^rct_' },
              description: 'Receipt ID (starts with rct_)',
            },
            {
              name: 'format',
              in: 'query',
              required: false,
              schema: { type: 'string', enum: ['json'] },
              description: 'Set to json to force JSON instead of the human view',
            },
          ],
          responses: {
            '200': {
              description: 'Receipt found and valid',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/VerifyReceiptResponse' } } },
            },
            '404': { description: 'Receipt not found, expired, or deleted', content: errorContent },
          },
        },
      },
      '/v1/receipts/{receiptId}/status': {
        get: {
          tags: ['Legacy receipts'],
          operationId: 'checkReceiptStatus',
          summary: 'Poll legacy receipt status',
          description: 'Lightweight status response for polling loops.',
          security: [],
          parameters: [
            {
              name: 'receiptId',
              in: 'path',
              required: true,
              schema: { type: 'string', pattern: '^rct_' },
            },
          ],
          responses: {
            '200': {
              description: 'Status retrieved',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusResponse' } } },
            },
            '404': { description: 'Receipt not found, expired, or deleted', content: errorContent },
          },
        },
      },
      '/v1/auth/signup': {
        post: {
          tags: ['Account'],
          operationId: 'signup',
          summary: 'Get an API key for legacy receipts',
          description:
            'Creates an API key for the legacy receipt API. Release proofs do not use this key. Save returned keys immediately; they cannot be retrieved later.',
          security: [],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } } },
          },
          responses: {
            '201': {
              description: 'Account created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SignupResponse' } } },
            },
            '400': { description: 'Invalid email', content: errorContent },
            '409': { description: 'Email already has an API key', content: errorContent },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        githubOidc: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'GitHub Actions OIDC token requested with audience https://proofslip.ai. This is not a ProofSlip API key.',
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'ProofSlip API key (starts with ak_) for the legacy receipt API.',
        },
      },
      schemas: {
        CreateReleaseProofRequest: {
          type: 'object',
          properties: {
            schema_version: { type: 'string', const: 'release-proof/v1', default: 'release-proof/v1' },
            idempotency_key: { type: 'string', minLength: 1, maxLength: 255 },
            deployment: { $ref: '#/components/schemas/DeploymentTarget' },
            submitted_context: {
              type: 'object',
              maxProperties: 10,
              additionalProperties: { type: 'string', maxLength: 256 },
              description: 'Unverified labels supplied by the workflow. Serialized size is limited to 1KB.',
            },
          },
        },
        DeploymentTarget: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri', maxLength: 512, description: 'Public HTTPS deployment URL.' },
            health_path: { type: 'string', maxLength: 256, pattern: '^/' },
          },
        },
        ReleaseProof: {
          type: 'object',
          required: [
            'proof_id', 'proof_url', 'schema_version', 'is_valid', 'is_expired', 'trust_level',
            'verification_method', 'issuer', 'observations', 'submitted_context', 'issued_at', 'expires_at',
          ],
          properties: {
            proof_id: { type: 'string', pattern: '^prf_' },
            proof_url: { type: 'string', format: 'uri' },
            schema_version: { type: 'string', const: 'release-proof/v1' },
            is_valid: { type: 'boolean', description: 'True while the 90-day validity window remains open.' },
            is_expired: { type: 'boolean' },
            trust_level: { type: 'string', const: 'provider_verified' },
            verification_method: { type: 'string', const: 'github_actions_oidc' },
            issuer: { $ref: '#/components/schemas/GitHubActionsIssuer' },
            observations: {
              type: 'array',
              items: { $ref: '#/components/schemas/HttpObservation' },
              description: 'Facts observed separately by ProofSlip; never provider-verified.',
            },
            submitted_context: {
              type: ['object', 'null'],
              additionalProperties: { type: 'string' },
              description: 'Caller-supplied labels. Not verified.',
            },
            issued_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
        GitHubActionsIssuer: {
          type: 'object',
          required: [
            'type', 'repository', 'repository_id', 'repository_owner', 'repository_owner_id',
            'repository_visibility', 'ref', 'sha', 'workflow_ref', 'run_id', 'run_attempt',
            'actor', 'event_name', 'subject', 'run_url', 'commit_url',
          ],
          properties: {
            type: { type: 'string', const: 'github_actions' },
            repository: { type: 'string' },
            repository_id: { type: 'string' },
            repository_owner: { type: 'string' },
            repository_owner_id: { type: 'string' },
            repository_visibility: { type: 'string' },
            ref: { type: 'string' },
            sha: { type: 'string' },
            workflow_ref: { type: 'string' },
            run_id: { type: 'string' },
            run_attempt: { type: 'integer', minimum: 1 },
            actor: { type: 'string' },
            event_name: { type: 'string' },
            subject: { type: 'string' },
            run_url: { type: 'string', format: 'uri' },
            commit_url: { type: 'string', format: 'uri' },
          },
        },
        HttpObservation: {
          type: 'object',
          required: ['kind', 'method', 'url', 'observed_at', 'note'],
          properties: {
            kind: { type: 'string', const: 'http_check' },
            method: { type: 'string', const: 'proofslip_http_observation' },
            url: { type: 'string', format: 'uri' },
            status_code: { type: 'integer', minimum: 100, maximum: 599 },
            response_time_ms: { type: 'integer', minimum: 0 },
            observed_at: { type: 'string', format: 'date-time' },
            error: { type: 'string', const: 'observation_failed' },
            reason: { type: 'string' },
            note: { type: 'string' },
          },
        },
        CreateReceiptRequest: {
          type: 'object',
          required: ['type', 'status', 'summary'],
          properties: {
            type: { type: 'string', enum: ['action', 'approval', 'handshake', 'resume', 'failure'] },
            status: { type: 'string' },
            summary: { type: 'string', maxLength: 280 },
            payload: { type: 'object', description: 'Optional structured JSON data (max 4KB).' },
            ref: { type: 'object' },
            expires_in: { type: 'integer', minimum: 60, maximum: 86400, default: 86400 },
            idempotency_key: { type: 'string' },
            audience: { type: 'string', enum: ['human'] },
          },
        },
        CreateReceiptResponse: {
          type: 'object',
          properties: {
            receipt_id: { type: 'string' },
            type: { type: 'string' },
            status: { type: 'string' },
            summary: { type: 'string' },
            verify_url: { type: 'string', format: 'uri' },
            created_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
            idempotency_key: { type: ['string', 'null'] },
            audience: { type: ['string', 'null'] },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: ['integer', 'null'] },
          },
        },
        VerifyReceiptResponse: {
          type: 'object',
          properties: {
            receipt_id: { type: 'string' },
            valid: { type: 'boolean' },
            type: { type: 'string' },
            status: { type: 'string' },
            summary: { type: 'string' },
            payload: { type: ['object', 'null'] },
            ref: { type: ['object', 'null'] },
            created_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
            expired: { type: 'boolean' },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: ['integer', 'null'] },
          },
        },
        StatusResponse: {
          type: 'object',
          properties: {
            receipt_id: { type: 'string' },
            status: { type: 'string' },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: ['integer', 'null'] },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            source: { type: 'string', enum: ['api', 'web'], default: 'api' },
          },
        },
        SignupResponse: {
          type: 'object',
          properties: {
            api_key: { type: 'string', description: 'Returned only when source is api.' },
            tier: { type: 'string' },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          required: ['error', 'message', 'request_id'],
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            request_id: { type: ['string', 'null'] },
          },
        },
      },
    },
  }
}
