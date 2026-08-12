/**
 * ShiVi X100+ Kernel — Capability & Risk Governance Primitives
 * Standard: SAD v2.0 §14, TDA v1.1 §14, FTL-KER-003
 */

export type RiskLevel = 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';

export interface CapabilityRule {
  capabilityId: string;
  resource: string;
  operation: string;
  riskLevel: RiskLevel;
  requiresHumanApproval: boolean;
  maxDelegationDepth: number;
}

export interface DelegationStep {
  issuerId: string;
  subjectId: string;
  capabilityId: string;
  timestamp: number;
  riskLevel: RiskLevel;
}

export interface CapabilityToken {
  tokenId: string;
  tenantId: string;
  principalId: string;
  capability: CapabilityRule;
  delegationChain: DelegationStep[];
  issuedAt: number;
  expiresAt: number;
  revoked: boolean;
}

export class CapabilityViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CapabilityViolationError';
  }
}

export class CapabilityBroker {
  private static activeTokens = new Map<string, CapabilityToken>();

  public static getRiskLevelNumeric(riskLevel: RiskLevel): number {
    const riskMap: Record<RiskLevel, number> = {
      T0: 0,
      T1: 1,
      T2: 2,
      T3: 3,
      T4: 4,
      T5: 5,
    };
    return riskMap[riskLevel];
  }

  public static issueToken(
    tenantId: string,
    principalId: string,
    capability: CapabilityRule,
    ttlSeconds: number = 300,
    delegationChain: DelegationStep[] = []
  ): CapabilityToken {
    if (this.getRiskLevelNumeric(capability.riskLevel) >= 4) {
      capability.requiresHumanApproval = true;
    }

    const now = Math.floor(Date.now() / 1000);
    const token: CapabilityToken = {
      tokenId: `cap_${Math.random().toString(36).substring(2, 11)}_${now}`,
      tenantId,
      principalId,
      capability,
      delegationChain,
      issuedAt: now,
      expiresAt: now + ttlSeconds,
      revoked: false,
    };

    this.activeTokens.set(token.tokenId, token);
    return token;
  }

  public static delegateToken(
    parentToken: CapabilityToken,
    delegateSubjectId: string,
    ttlSeconds: number = 180
  ): CapabilityToken {
    if (parentToken.revoked || parentToken.expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new CapabilityViolationError(`Cannot delegate expired or revoked token '${parentToken.tokenId}'`);
    }

    const currentDepth = parentToken.delegationChain.length;
    if (currentDepth >= parentToken.capability.maxDelegationDepth) {
      throw new CapabilityViolationError(
        `Delegation depth limit (${parentToken.capability.maxDelegationDepth}) exceeded for token '${parentToken.tokenId}'`
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const newStep: DelegationStep = {
      issuerId: parentToken.principalId,
      subjectId: delegateSubjectId,
      capabilityId: parentToken.capability.capabilityId,
      timestamp: now,
      riskLevel: parentToken.capability.riskLevel,
    };

    return this.issueToken(
      parentToken.tenantId,
      delegateSubjectId,
      parentToken.capability,
      ttlSeconds,
      [...parentToken.delegationChain, newStep]
    );
  }

  public static validateCapabilityExecution(
    tokenId: string,
    requiredOperation: string,
    requiresApprovalGranted: boolean = false
  ): boolean {
    const token = this.activeTokens.get(tokenId);
    if (!token) {
      throw new CapabilityViolationError(`Token '${tokenId}' not found.`);
    }

    const now = Math.floor(Date.now() / 1000);
    if (token.revoked || token.expiresAt <= now) {
      throw new CapabilityViolationError(`Token '${tokenId}' is expired or revoked.`);
    }

    if (
      requiredOperation !== '*' &&
      token.capability.operation !== '*' &&
      token.capability.operation !== requiredOperation
    ) {
      throw new CapabilityViolationError(
        `Token capability operation '${token.capability.operation}' does not match required '${requiredOperation}'`
      );
    }

    if (token.capability.requiresHumanApproval && !requiresApprovalGranted) {
      throw new CapabilityViolationError(
        `Action requires human approval for risk level ${token.capability.riskLevel} (Capability: ${token.capability.capabilityId})`
      );
    }

    return true;
  }

  public static revokeToken(tokenId: string): void {
    const token = this.activeTokens.get(tokenId);
    if (token) {
      token.revoked = true;
    }
  }
}
