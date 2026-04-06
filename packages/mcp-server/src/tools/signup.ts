import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ProofSlipClient } from '@proofslip/sdk';
import { ProofSlipError } from '@proofslip/sdk';

export function registerSignupTool(
  server: McpServer,
  client: ProofSlipClient,
) {
  server.tool(
    'signup',
    'Get a free ProofSlip API key. Returns the key directly — save it immediately, it cannot be retrieved later. ' +
      'Only needed once. After signup, configure the key as PROOFSLIP_API_KEY environment variable to use create_receipt. ' +
      'Free tier: 500 receipts per month.',
    {
      email: z.string().describe('Your email address'),
    },
    async ({ email }) => {
      try {
        const data = await client.signup(email);
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
