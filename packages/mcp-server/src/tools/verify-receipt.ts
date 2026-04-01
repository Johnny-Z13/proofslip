import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '../client.js';

export function registerVerifyReceiptTool(
  server: McpServer,
  client: ProofSlipClient,
) {
  server.tool(
    'verify_receipt',
    'Verify a ProofSlip receipt and retrieve its full data (type, status, summary, payload, ref, expiry). ' +
      'Use this to check what happened before deciding what to do next. ' +
      'Returns the complete receipt if valid, or a not_found error if expired or missing. ' +
      'No API key required.',
    {
      receipt_id: z
        .string()
        .describe('The receipt ID to verify (starts with rct_)'),
    },
    async ({ receipt_id }) => {
      const result = await client.verifyReceipt(receipt_id);
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
