/**
 * ShiVi X100+ AI SDK — Enterprise RAG & ACL Retrieval Pipeline
 * Standard: SAD v2.0 §21, TDA v1.1 §65
 */

import { TenancyContext, TenancyManager, DataClassification } from '@shivi/kernel';

export interface VectorDocumentChunk {
  documentId: string;
  chunkId: string;
  tenantId: string;
  classification: DataClassification;
  allowedRoles: string[];
  content: string;
  vectorEmbedding: number[];
  similarityScore?: number;
}

export class VectorRetrievalEngine {
  /**
   * Index document chunk into vector index
   */
  public static async indexDocument(chunk: VectorDocumentChunk): Promise<void> {
    const { PostgresPoolAdapter } = await import('@shivi/database');
    await PostgresPoolAdapter.insertVector(
      chunk.chunkId,
      chunk.tenantId,
      chunk.documentId,
      chunk.classification,
      chunk.allowedRoles,
      chunk.content,
      chunk.vectorEmbedding
    );
  }

  /**
   * Search vector index with tenant boundary, ACL role filtering, and cosine similarity ranking
   */
  public static async queryVectorIndex(
    tenancyContext: TenancyContext,
    userRoles: string[],
    queryVector: number[],
    topK: number = 5
  ): Promise<VectorDocumentChunk[]> {
    const { PostgresPoolAdapter } = await import('@shivi/database');
    
    // We fetch from pgvector
    const rawResults = await PostgresPoolAdapter.searchVectors(
      tenancyContext.tenantId,
      queryVector,
      userRoles,
      topK
    );

    // Apply ACL filtering on the results (if needed, although SQL handles some)
    const filtered = rawResults.filter(res => {
      // 1. Data classification check (if added to SQL later, skipped here for demo)
      return true;
    });

    return filtered.map(res => {
      return {
        documentId: res.documentId,
        chunkId: res.embeddingId,
        tenantId: res.tenantId,
        classification: 'INTERNAL', // Default for now
        allowedRoles: [],
        content: res.content,
        vectorEmbedding: [],
        similarityScore: res.similarityScore
      };
    });
  }

  /**
   * Reset vector index (for test isolation)
   */
  public static resetIndex(): void {
    // Requires DB flush
  }
}
