import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '../client.js';

export function registerCheckStatusTool(
  server: McpServer,
  client: ProofSlipClient,
) {
  server.tool(
    'check_receipt_status',
    'Lightweight status poll for a ProofSlip receipt. ' +
      'Returns only status, is_terminal, and next_poll_after_seconds — no payload or summary. ' +
      'Use this instead of verify_receipt when you only need to know if a receipt state has changed. ' +
      'If is_terminal is false, wait next_poll_after_seconds before checking again. ' +
      'No API key required.',
    {
      receipt_id: z
        .string()
        .describe('The receipt ID to check (starts with rct_)'),
    },
    async ({ receipt_id }) => {
      const result = await client.checkStatus(receipt_id);
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
