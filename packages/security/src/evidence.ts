/**
 * ShiVi X100+ Security — Cryptographic Evidence Ledger
 * Standard: SAD v2.0 §29, TDA v1.1 §79, FTL-KER-008
 */

import * as crypto from 'node:crypto';

export interface EvidenceRecord {
  recordId: string;
  tenantId: string;
  principalId: string;
  action: string;
  riskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  payload: Record<string, unknown>;
  timestamp: number;
  previousHash: string;
  hash: string;
}

export class EvidenceLedger {
  private static ledger: EvidenceRecord[] = [];
  private static GENESIS_HASH = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Calculate SHA-256 hash for evidence record
   */
  public static calculateHash(
    recordId: string,
    tenantId: string,
    principalId: string,
    action: string,
    riskLevel: string,
    payload: Record<string, unknown>,
    timestamp: number,
    previousHash: string
  ): string {
    const dataToHash = `${recordId}|${tenantId}|${principalId}|${action}|${riskLevel}|${JSON.stringify(payload)}|${timestamp}|${previousHash}`;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }

  /**
   * Record a tamper-evident audit entry in the evidence ledger
   */
  public static appendEvidence(
    tenantId: string,
    principalId: string,
    action: string,
    riskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5',
    payload: Record<string, unknown>
  ): EvidenceRecord {
    const previousRecord = this.ledger[this.ledger.length - 1];
    const previousHash = previousRecord ? previousRecord.hash : this.GENESIS_HASH;

    const recordId = `evd_${crypto.randomUUID()}`;
    const timestamp = Date.now();

    const hash = this.calculateHash(
      recordId,
      tenantId,
      principalId,
      action,
      riskLevel,
      payload,
      timestamp,
      previousHash
    );

    const record: EvidenceRecord = {
      recordId,
      tenantId,
      principalId,
      action,
      riskLevel,
      payload,
      timestamp,
      previousHash,
      hash,
    };

    this.ledger.push(record);
    return record;
  }

  /**
   * Verify integrity of the entire evidence ledger chain
   */
  public static verifyChainIntegrity(): boolean {
    for (let i = 0; i < this.ledger.length; i++) {
      const current = this.ledger[i];
      const previous = i > 0 ? this.ledger[i - 1] : undefined;

      const expectedPrevHash = previous ? previous.hash : this.GENESIS_HASH;
      if (current.previousHash !== expectedPrevHash) {
        return false; // Broken link in hash chain
      }

      const recalculatedHash = this.calculateHash(
        current.recordId,
        current.tenantId,
        current.principalId,
        current.action,
        current.riskLevel,
        current.payload,
        current.timestamp,
        current.previousHash
      );

      if (current.hash !== recalculatedHash) {
        return false; // Tampered content
      }
    }
    return true;
  }

  /**
   * Get all evidence records for a tenant
   */
  public static getTenantEvidence(tenantId: string): EvidenceRecord[] {
    return this.ledger.filter((r) => r.tenantId === tenantId);
  }
}
