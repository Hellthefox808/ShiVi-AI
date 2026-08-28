/**
 * service-mcp - Model Context Protocol gateway
 *
 * @packageDocumentation
 */

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

export class MCPService {
  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async handleJsonRpc(req: McpJsonRpcRequest): Promise<McpJsonRpcResponse> {
    if (req.method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id: req.id,
        result: {
          tools: [
            { name: 'database_query', description: 'Query Postgres/pgvector database' },
            { name: 'document_search', description: 'Vector similarity search' },
          ],
        },
      };
    }
    return {
      jsonrpc: '2.0',
      id: req.id,
      result: {
        content: [{ type: 'text', text: 'MCP execution completed successfully' }],
      },
    };
  }
}

export default MCPService;
