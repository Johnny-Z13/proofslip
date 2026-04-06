import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '@proofslip/sdk';
import { ProofSlipError } from '@proofslip/sdk';

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
      try {
        const data = await client.checkStatus(receipt_id);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }],
        };
      } catch (err) {
        const message = err instanceof ProofSlipError
          ? `Error (${err.status}): ${err.message}`
          : `Error: ${err instanceof Error ? err.message : 'Unknown error'}`;
        return {
          isError: true,
          content: [{ type: 'text' as const, text: message }],
        };
      }
    },
  );
}
