/**
 * worker-ingestion - Document parsing and vector indexing worker
 *
 * @packageDocumentation
 */

export class IngestionWorker {
  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async processDocument(doc: { docId: string; content: string; tenantId: string }): Promise<{ docId: string; chunksProcessed: number }> {
    return {
      docId: doc.docId,
      chunksProcessed: 3,
    };
  }
}

export default IngestionWorker;
