import { describe, it, expect } from 'vitest';
import { EnterpriseSearchDomainEngine } from '../index.js';
import { VectorRetrievalEngine } from '@shivi/ai-sdk';

describe('ShiVi System 12: Enterprise Search Domain Suite', () => {
  it('should execute search and return authorized vector chunks', async () => {
    VectorRetrievalEngine.resetIndex();
    VectorRetrievalEngine.indexDocument({
      documentId: 'doc-search-1',
      chunkId: 'chk-s1',
      tenantId: 'tenant-search-1',
      classification: 'INTERNAL',
      allowedRoles: ['analyst'],
      content: 'Quarterly financial report details',
      vectorEmbedding: [1, 0, 0],
    });

    const res = await EnterpriseSearchDomainEngine.executeSearch({
      tenantId: 'tenant-search-1',
      queryText: 'financial results',
      queryVector: [1, 0, 0],
      userRoles: ['analyst'],
    });

    expect(res.totalHits).toBe(1);
    expect(res.chunks[0].chunkId).toBe('chk-s1');
  });
});
