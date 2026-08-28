import { describe, it, expect } from 'vitest';
import { RAGService } from '../index.js';

describe('RAGService Retrieval Suite', () => {
  const service = new RAGService();

  it('should ingest and index a document into chunks', async () => {
    const res = await service.ingestDocument({
      tenantId: 'tenant_rag',
      documentId: 'doc_sec_10k',
      title: 'SEC 10-K Report',
      content: 'ShiVi Enterprise Operating System generates annual recurring revenue of $100M.',
      classification: 'CONFIDENTIAL',
    });
    expect(res.indexedChunksCount).toBeGreaterThan(0);
    expect(res.documentId).toBe('doc_sec_10k');
  });

  it('should retrieve context matching vector query', async () => {
    const contexts = await service.retrieveContext({
      tenantId: 'tenant_rag',
      query: 'What is the ARR?',
      topK: 3,
      requiredClassification: 'CONFIDENTIAL',
    });
    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts[0].score).toBeGreaterThan(0.8);
  });

  it('should verify chunk cryptographic integrity', async () => {
    const valid = await service.verifyChunkIntegrity('chunk_123', 'hash_abc');
    expect(valid).toBe(true);
  });
});
