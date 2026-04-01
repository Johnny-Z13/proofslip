import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '../client.js';

export function registerCreateReceiptTool(
  server: McpServer,
  client: ProofSlipClient,
) {
  server.tool(
    'create_receipt',
    'Create a ProofSlip receipt to record that something happened. ' +
      "Use 'action' for completed events, 'approval' for decisions awaiting review, " +
      "'handshake' for agent-to-agent coordination, 'resume' for continuation bookmarks, " +
      "'failure' for structured error records. Returns a receipt_id and verify_url. " +
      'Receipts expire after 24 hours by default.',
    {
      type: z
        .enum(['action', 'approval', 'handshake', 'resume', 'failure'])
        .describe('Receipt type'),
      status: z.string().describe('Freeform status string (e.g. "success", "pending", "failed")'),
      summary: z
        .string()
        .max(280)
        .describe('Human-readable summary of what happened (max 280 chars)'),
      payload: z
        .record(z.unknown())
        .optional()
        .describe('Optional structured JSON data (max 4KB)'),
      ref: z
        .object({
          run_id: z.string().optional(),
          agent_id: z.string().optional(),
          action_id: z.string().optional(),
          workflow_id: z.string().optional(),
          session_id: z.string().optional(),
        })
        .optional()
        .describe('Optional workflow reference IDs for tracing'),
      expires_in: z
        .number()
        .min(60)
        .max(86400)
        .optional()
        .describe('TTL in seconds (60-86400, default 86400 = 24 hours)'),
      idempotency_key: z
        .string()
        .optional()
        .describe('Prevents duplicate receipts if you retry the same request'),
      audience: z
        .literal('human')
        .optional()
        .describe('Set to "human" to enrich the verification page with social cards'),
    },
    async (params) => {
      if (!client.hasApiKey()) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'No API key configured. Set the PROOFSLIP_API_KEY environment variable, or use the signup tool to get a free key.',
            },
          ],
        };
      }
      const result = await client.createReceipt(params);
      if (!result.ok) {
        return {
          isError: true,
          content: [{ type: 'text' as const, text: `Error (${result.status}): ${result.message}` }],
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(result.data, null, 2) }],
      };
    },
  );
}
