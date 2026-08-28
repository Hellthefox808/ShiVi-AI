import { describe, it, expect } from 'vitest';
import { SearchService } from '../index.js';

describe('SearchService Enterprise Suite', () => {
  const service = new SearchService();

  it('should perform semantic hybrid search across documents', async () => {
    const results = await service.search({
      tenantId: 'tenant_search',
      query: 'SOC2 Type II compliance controls',
      limit: 5,
    });
    expect(results.hits.length).toBeGreaterThan(0);
    expect(results.hits[0].score).toBeGreaterThan(0.7);
  });

  it('should index search documents with faceted metadata', async () => {
    const ack = await service.indexRecord({
      id: 'rec_audit_1',
      tenantId: 'tenant_search',
      title: 'Audit Policy 2026',
      content: 'Zero trust security controls',
      tags: ['security', 'compliance'],
    });
    expect(ack.success).toBe(true);
  });
});
