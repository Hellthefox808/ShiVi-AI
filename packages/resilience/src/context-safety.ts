/**
 * ShiVi X100+ Resilience — Context Safety & Citation Integrity Pipeline
 * Standard: SAD v2.0 §21, TDA v1.1 §66, FTL-KER-007
 */

import * as crypto from 'node:crypto';
import { DataClassification } from '@shivi/kernel';

export interface RagChunkValidationResult {
  chunkId: string;
  validHash: boolean;
  fresh: boolean;
  classificationAllowed: boolean;
  rejectionReason?: string;
}

export interface CitationClaim {
  claimText: string;
  sourceChunkId: string;
  sourceChunkHash: string;
}

export interface CitationIntegrityAuditResult {
  valid: boolean;
  totalClaims: number;
  unverifiedClaimsCount: number;
  invalidCitations: CitationClaim[];
}

export class ContextSafetyPipeline {
  /**
   * Verify SHA-256 content hash of RAG document chunk
   */
  public static verifyChunkHash(content: string, expectedHash: string): boolean {
    const computedHash = crypto.createHash('sha256').update(content).digest('hex');
    return computedHash === expectedHash;
  }

  /**
   * Validate chunk freshness (reject chunks older than maxAgeDays)
   */
  public static isChunkFresh(chunkTimestamp: number, maxAgeDays: number = 90): boolean {
    const ageMs = Date.now() - chunkTimestamp;
    const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;
    return ageMs <= maxAgeMs;
  }

  /**
   * Audit citation integrity for AI-generated responses
   */
  public static auditCitationIntegrity(
    claims: CitationClaim[],
    validChunkHashes: Map<string, string>
  ): CitationIntegrityAuditResult {
    const invalidCitations: CitationClaim[] = [];

    for (const claim of claims) {
      const expectedHash = validChunkHashes.get(claim.sourceChunkId);
      if (!expectedHash || expectedHash !== claim.sourceChunkHash) {
        invalidCitations.push(claim);
      }
    }

    return {
      valid: invalidCitations.length === 0,
      totalClaims: claims.length,
      unverifiedClaimsCount: invalidCitations.length,
      invalidCitations,
    };
  }
}
