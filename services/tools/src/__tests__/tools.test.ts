import { describe, it, expect } from 'vitest';
import { ToolsService } from '../index.js';

describe('ToolsService Platform Suite', () => {
  const service = new ToolsService();

  it('should register a tool definition', async () => {
    const tool = await service.registerTool({
      name: 'search_vector_kb',
      description: 'Search internal knowledge base',
      parameters: { type: 'object', properties: { query: { type: 'string' } } },
      capabilityRequired: 'T1',
    });
    expect(tool.id).toBeDefined();
    expect(tool.name).toBe('search_vector_kb');
  });

  it('should invoke a registered tool', async () => {
    const res = await service.invokeTool({
      toolId: 'tool_search',
      tenantId: 'tenant_tools',
      arguments: { query: 'financials' },
    });
    expect(res.executionId).toBeDefined();
    expect(res.status).toBe('completed');
  });

  it('should list all available tools', async () => {
    const tools = await service.listTools('tenant_tools');
    expect(tools.length).toBeGreaterThan(0);
  });
});
