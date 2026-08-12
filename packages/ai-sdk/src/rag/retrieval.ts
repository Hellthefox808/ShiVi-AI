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
  private static vectorIndex: VectorDocumentChunk[] = [];

  /**
   * Index document chunk into vector index
   */
  public static indexDocument(chunk: VectorDocumentChunk): void {
    this.vectorIndex.push(chunk);
  }

  /**
   * Calculate cosine similarity between two equal-length numeric vectors
   */
  public static calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) {
      return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Search vector index with tenant boundary, ACL role filtering, and cosine similarity ranking
   */
  public static queryVectorIndex(
    tenancyContext: TenancyContext,
    userRoles: string[],
    queryVector: number[],
    topK: number = 5
  ): VectorDocumentChunk[] {
    const scoredChunks = this.vectorIndex
      .filter((chunk) => {
        // 1. Strict tenant boundary match
        if (chunk.tenantId !== tenancyContext.tenantId) {
          return false;
        }

        // 2. Data classification check
        if (!TenancyManager.validateClassificationAccess(tenancyContext, chunk.classification)) {
          return false;
        }

        // 3. ACL role check (user must have at least one allowed role)
        if (chunk.allowedRoles.length > 0) {
          const hasRole = userRoles.some((role) => chunk.allowedRoles.includes(role));
          if (!hasRole) return false;
        }

        return true;
      })
      .map((chunk) => {
        const score = queryVector.length > 0
          ? this.calculateCosineSimilarity(queryVector, chunk.vectorEmbedding)
          : 1.0;
        return {
          ...chunk,
          similarityScore: Number(score.toFixed(4)),
        };
      });

    // Rank descending by similarity score
    scoredChunks.sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0));
    return scoredChunks.slice(0, topK);
  }

  /**
   * Reset vector index (for test isolation)
   */
  public static resetIndex(): void {
    this.vectorIndex = [];
  }
}
