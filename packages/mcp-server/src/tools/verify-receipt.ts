import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '@proofslip/sdk';
import { ProofSlipError } from '@proofslip/sdk';

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
      try {
        const data = await client.verifyReceipt(receipt_id);
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
