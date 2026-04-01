import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ProofSlipClient } from './client.js';
import { resolveConfig } from './config.js';
import { registerCreateReceiptTool } from './tools/create-receipt.js';
import { registerVerifyReceiptTool } from './tools/verify-receipt.js';
import { registerCheckStatusTool } from './tools/check-status.js';
import { registerSignupTool } from './tools/signup.js';

export function createServer(options?: { apiKey?: string; baseUrl?: string }) {
  const config = resolveConfig(options);
  const client = new ProofSlipClient(config.baseUrl, config.apiKey);

  const server = new McpServer({
    name: 'proofslip',
    version: '0.1.0',
  });

  registerCreateReceiptTool(server, client);
  registerVerifyReceiptTool(server, client);
  registerCheckStatusTool(server, client);
  registerSignupTool(server, client);

  return server;
}

// When run directly — start stdio transport
const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
