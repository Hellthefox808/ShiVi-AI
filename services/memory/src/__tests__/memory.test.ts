import { describe, it, expect } from 'vitest';
import { MemoryService } from '../index.js';

describe('MemoryService Platform Suite', () => {
  const service = new MemoryService();

  it('should store and retrieve working memory', async () => {
    const record = await service.store({
      tenantId: 'tenant_mem',
      agentId: 'agent_1',
      tier: 'working',
      key: 'current_query',
      value: { query: 'Summarize Q3' },
      ttlSeconds: 3600,
    });
    expect(record.id).toBeDefined();
    expect(record.key).toBe('current_query');

    const results = await service.retrieve('tenant_mem', 'agent_1', 'working', 'current_query');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should clear agent memory tier', async () => {
    await expect(service.clearAgentMemory('tenant_mem', 'agent_1', 'working')).resolves.not.toThrow();
  });
});
