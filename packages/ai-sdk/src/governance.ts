/**
 * ShiVi AI Gateway — Governance Envelope
 * Standard: SAD v2.0 §19, TDA v1.1 §19
 */

export interface AiGovernanceEnvelope {
  tenantId: string;
  userId: string;
  agentId: string;
  taskId: string;
  workflowId: string;
  modelId: string;
  modelVersion: string;
  promptVersion: string;
  policyVersion: string;
  contextManifestHash: string;
  toolPolicyId: string;
  riskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  maxBudgetUSD: number;
  traceId: string;
  timestamp: number;
}

export class AiGovernanceEngine {
  /**
   * Constructs non-repudiable governance envelope for AI request execution
   */
  public static createEnvelope(params: Omit<AiGovernanceEnvelope, 'timestamp'>): AiGovernanceEnvelope {
    return {
      ...params,
      timestamp: Date.now()
    };
  }

  /**
   * Validate governance parameters prior to forwarding to LLM providers
   */
  public static validateEnvelope(envelope: AiGovernanceEnvelope): { valid: boolean; reason?: string } {
    if (!envelope.tenantId) return { valid: false, reason: 'Missing tenantId' };
    if (!envelope.agentId) return { valid: false, reason: 'Missing agentId' };
    if (!envelope.traceId) return { valid: false, reason: 'Missing traceId' };
    if (envelope.maxBudgetUSD <= 0) return { valid: false, reason: 'Invalid maxBudgetUSD limit' };

    return { valid: true };
  }
}
