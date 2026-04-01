export function getOpenApiSpec(): object {
  return {
    openapi: '3.1.0',
    info: {
      title: 'ProofSlip API',
      version: '1.0.0',
      description:
        'Ephemeral verification receipts for AI agent workflows. Create short-lived proof tokens that agents verify before acting.',
      contact: { url: 'https://proofslip.ai' },
    },
    servers: [{ url: 'https://proofslip.ai' }],
    paths: {
      '/v1/receipts': {
        post: {
          operationId: 'createReceipt',
          summary: 'Create a receipt',
          description:
            'Issue a verifiable receipt when something happens. Receipts expire after 24 hours by default.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateReceiptRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Receipt created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateReceiptResponse' },
                },
              },
            },
            '400': {
              description: 'Validation error',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '401': {
              description: 'Unauthorized — missing or invalid API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '409': {
              description: 'Idempotency conflict',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Rate limited (60 requests/min per API key)',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/v1/verify/{receiptId}': {
        get: {
          operationId: 'verifyReceipt',
          summary: 'Verify a receipt',
          description:
            'Verify a receipt and retrieve its full data. No authentication required.',
          parameters: [
            {
              name: 'receiptId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Receipt ID (starts with rct_)',
            },
            {
              name: 'format',
              in: 'query',
              required: false,
              schema: { type: 'string', enum: ['json'] },
              description: 'Set to "json" to force JSON response',
            },
          ],
          responses: {
            '200': {
              description: 'Receipt found and valid',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/VerifyReceiptResponse' },
                },
              },
            },
            '404': {
              description: 'Receipt not found, expired, or deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/v1/receipts/{receiptId}/status': {
        get: {
          operationId: 'checkReceiptStatus',
          summary: 'Poll receipt status',
          description:
            'Lightweight status check. Returns only status fields — no summary, payload, or ref. Use for polling.',
          parameters: [
            {
              name: 'receiptId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Receipt ID (starts with rct_)',
            },
          ],
          responses: {
            '200': {
              description: 'Status retrieved',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StatusResponse' },
                },
              },
            },
            '404': {
              description: 'Receipt not found, expired, or deleted',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/v1/auth/signup': {
        post: {
          operationId: 'signup',
          summary: 'Get a free API key',
          description:
            'Create a free ProofSlip account and receive an API key. With source "api", the key is returned directly. Save it immediately — it cannot be retrieved later.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SignupRequest' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Account created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SignupResponse' },
                },
              },
            },
            '400': {
              description: 'Invalid email',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '409': {
              description: 'Email already has an API key',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'ProofSlip API key (starts with ak_)',
        },
      },
      schemas: {
        CreateReceiptRequest: {
          type: 'object',
          required: ['type', 'status', 'summary'],
          properties: {
            type: {
              type: 'string',
              enum: ['action', 'approval', 'handshake', 'resume', 'failure'],
              description: 'Receipt type',
            },
            status: {
              type: 'string',
              description: 'Freeform status string',
            },
            summary: {
              type: 'string',
              maxLength: 280,
              description: 'Human-readable summary of what happened',
            },
            payload: {
              type: 'object',
              description: 'Optional structured JSON data (max 4KB)',
            },
            ref: {
              type: 'object',
              description: 'Optional workflow reference IDs',
              properties: {
                run_id: { type: 'string' },
                agent_id: { type: 'string' },
                action_id: { type: 'string' },
                workflow_id: { type: 'string' },
                session_id: { type: 'string' },
              },
            },
            expires_in: {
              type: 'integer',
              minimum: 60,
              maximum: 86400,
              default: 86400,
              description: 'TTL in seconds (default 24 hours)',
            },
            idempotency_key: {
              type: 'string',
              description: 'Prevents duplicate receipt creation on retry',
            },
            audience: {
              type: 'string',
              enum: ['human'],
              description: 'Set to "human" to enrich verify page with social cards',
            },
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
            idempotency_key: { type: 'string', nullable: true },
            audience: { type: 'string' },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: 'integer', nullable: true },
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
            payload: { type: 'object', nullable: true },
            ref: { type: 'object', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            expires_at: { type: 'string', format: 'date-time' },
            expired: { type: 'boolean' },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: 'integer', nullable: true },
          },
        },
        StatusResponse: {
          type: 'object',
          properties: {
            receipt_id: { type: 'string' },
            status: { type: 'string' },
            is_terminal: { type: 'boolean' },
            next_poll_after_seconds: { type: 'integer', nullable: true },
            expires_at: { type: 'string', format: 'date-time' },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
            source: {
              type: 'string',
              enum: ['api', 'web'],
              default: 'api',
              description: '"api" returns the key directly, "web" emails it',
            },
          },
        },
        SignupResponse: {
          type: 'object',
          properties: {
            api_key: {
              type: 'string',
              description: 'Your API key (only returned when source is "api")',
            },
            tier: { type: 'string' },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  };
}
