import { describe, it, expect } from 'vitest';
import { IngestionWorker } from '../index.js';

describe('IngestionWorker Document Pipeline Suite', () => {
  const worker = new IngestionWorker();

  it('should chunk raw documents and generate vector embeddings', async () => {
    const res = await worker.processDocument({
      docId: 'doc_kb_1',
      content: 'ShiVi Enterprise Architecture zero trust security protocols.',
      tenantId: 'tenant_ingest',
    });
    expect(res.chunksProcessed).toBeGreaterThan(0);
  });
});
