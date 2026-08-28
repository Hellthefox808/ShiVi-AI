import { describe, it, expect } from 'vitest';
import { MCPService } from '../index.js';

describe('MCPService Gateway Suite', () => {
  const service = new MCPService();

  it('should handle JSON-RPC 2.0 tools/list method', async () => {
    const response = await service.handleJsonRpc({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect((response.result as any).tools).toBeDefined();
  });

  it('should handle JSON-RPC 2.0 tools/call method', async () => {
    const response = await service.handleJsonRpc({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'database_query',
        arguments: { sql: 'SELECT 1' },
      },
    });
    expect(response.jsonrpc).toBe('2.0');
    expect((response.result as any).content).toBeDefined();
  });
});
