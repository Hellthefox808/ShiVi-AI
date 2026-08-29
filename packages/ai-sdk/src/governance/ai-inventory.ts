/**
 * ShiVi AI Governance Fabric — AI Inventory & Asset Registry
 * Tracks every AI asset (agents, models, prompts, tools, MCP servers, etc.)
 * with ownership, classification, risk tiering, and shadow AI detection.
 */

import * as crypto from 'node:crypto';

export type AIAssetType =
  | 'AGENT'
  | 'MODEL'
  | 'PROMPT'
  | 'WORKFLOW'
  | 'TOOL'
  | 'MCP_SERVER'
  | 'EMBEDDING'
  | 'CLASSIFIER'
  | 'RERANKER'
  | 'EVALUATION_SUITE'
  | 'AI_FEATURE'
  | 'AI_VENDOR'
  | 'AI_INTEGRATION';

export type AIAssetStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'DEPRECATED'
  | 'UNDER_REVIEW'
  | 'BLOCKED';

export type ShadowAIClassification =
  | 'KNOWN'
  | 'APPROVED'
  | 'UNAPPROVED'
  | 'UNKNOWN'
  | 'SHADOW';

export type AISystemClassification = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  factor: string;
  weight: number;
  score: number;
  explanation: string;
}

export interface RiskAssessment {
  riskTier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  riskScore: number;
  factors: RiskFactor[];
  classification: AISystemClassification;
  assessedAt: number;
  assessedBy: string;
}

export interface OwnershipRecord {
  businessOwner: string;
  technicalOwner: string;
  securityOwner: string;
  dataOwner: string;
  complianceOwner: string;
}

export interface AIAsset {
  assetId: string;
  tenantId: string;
  type: AIAssetType;
  name: string;
  description: string;
  owner: OwnershipRecord;
  team: string;
  purpose: string;
  version: string;
  status: AIAssetStatus;
  riskTier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  dataScope: string[];
  permissions: string[];
  dependencies: string[];
  provider: string;
  environment: string;
  shadowClassification: ShadowAIClassification;
  riskAssessment?: RiskAssessment;
  createdAt: number;
  updatedAt: number;
}

export class AIInventoryRegistry {
  private static assets = new Map<string, AIAsset>();

  private static getKey(tenantId: string, assetId: string): string {
    return `${tenantId}:${assetId}`;
  }

  public static registerAsset(
    asset: Omit<AIAsset, 'createdAt' | 'updatedAt'>
  ): AIAsset {
    const key = this.getKey(asset.tenantId, asset.assetId);
    const now = Date.now();
    const newAsset: AIAsset = {
      ...asset,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(key, newAsset);
    return newAsset;
  }

  public static getAsset(tenantId: string, assetId: string): AIAsset | undefined {
    return this.assets.get(this.getKey(tenantId, assetId));
  }

  public static getAssetsByTenant(tenantId: string): AIAsset[] {
    const result: AIAsset[] = [];
    for (const asset of this.assets.values()) {
      if (asset.tenantId === tenantId) {
        result.push(asset);
      }
    }
    return result;
  }

  public static getAssetsByType(tenantId: string, type: AIAssetType): AIAsset[] {
    return this.getAssetsByTenant(tenantId).filter((a) => a.type === type);
  }

  private static riskTierValue(tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'): number {
    return parseInt(tier.substring(1), 10);
  }

  public static getAssetsByRisk(
    tenantId: string,
    minRisk: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'
  ): AIAsset[] {
    const minVal = this.riskTierValue(minRisk);
    return this.getAssetsByTenant(tenantId).filter(
      (a) => this.riskTierValue(a.riskTier) >= minVal
    );
  }

  public static classifySystem(
    tenantId: string,
    assetId: string,
    purpose: string,
    dataSensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
    autonomyLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'FULL',
    decisionImpact: 'INFORMATIONAL' | 'ADVISORY' | 'OPERATIONAL' | 'FINANCIAL' | 'CONTRACTUAL'
  ): AISystemClassification {
    let score = 0;
    if (dataSensitivity === 'RESTRICTED') score += 4;
    else if (dataSensitivity === 'CONFIDENTIAL') score += 3;
    else if (dataSensitivity === 'INTERNAL') score += 1;

    if (autonomyLevel === 'FULL') score += 4;
    else if (autonomyLevel === 'HIGH') score += 3;
    else if (autonomyLevel === 'MEDIUM') score += 2;

    if (decisionImpact === 'CONTRACTUAL' || decisionImpact === 'FINANCIAL') score += 4;
    else if (decisionImpact === 'OPERATIONAL') score += 2;

    if (score >= 10) return 'CRITICAL';
    if (score >= 7) return 'HIGH';
    if (score >= 4) return 'MEDIUM';
    return 'LOW';
  }

  public static calculateRiskTier(factors: {
    dataSensitivity: number;
    autonomy: number;
    externalSideEffects: number;
    financialImpact: number;
    customerImpact: number;
    regulatoryExposure: number;
    scale: number;
    reversibility: number;
  }): RiskAssessment {
    const weights = {
      dataSensitivity: 0.2,
      autonomy: 0.15,
      externalSideEffects: 0.15,
      financialImpact: 0.1,
      customerImpact: 0.15,
      regulatoryExposure: 0.15,
      scale: 0.05,
      reversibility: 0.05,
    };

    let totalScore = 0;
    const factorResults: RiskFactor[] = [];

    for (const [key, weight] of Object.entries(weights)) {
      const val = factors[key as keyof typeof factors];
      const normalizedScore = Math.max(0, Math.min(10, val));
      const weightedScore = normalizedScore * weight;
      totalScore += weightedScore;

      factorResults.push({
        factor: key,
        weight,
        score: normalizedScore,
        explanation: `Scored ${normalizedScore}/10 for ${key} with weight ${weight}.`,
      });
    }

    let tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5' = 'T0';
    let classification: AISystemClassification = 'LOW';

    if (totalScore >= 8.5) {
      tier = 'T5';
      classification = 'CRITICAL';
    } else if (totalScore >= 7) {
      tier = 'T4';
      classification = 'HIGH';
    } else if (totalScore >= 5.5) {
      tier = 'T3';
      classification = 'MEDIUM';
    } else if (totalScore >= 4) {
      tier = 'T2';
      classification = 'MEDIUM';
    } else if (totalScore >= 2) {
      tier = 'T1';
      classification = 'LOW';
    }

    return {
      riskTier: tier,
      riskScore: totalScore,
      factors: factorResults,
      classification,
      assessedAt: Date.now(),
      assessedBy: 'SYSTEM',
    };
  }

  public static detectShadowAI(
    tenantId: string,
    signalType: string,
    signalSource: string,
    details: Record<string, unknown>
  ): { classification: ShadowAIClassification; recommendation: string } {
    const assets = this.getAssetsByTenant(tenantId);
    const matchedAsset = assets.find((a) => a.provider === signalSource || a.name === signalSource);

    if (!matchedAsset) {
      return {
        classification: 'UNKNOWN',
        recommendation: `Unregistered AI signal detected from ${signalSource}. Investigate and register if legitimate.`,
      };
    }

    if (matchedAsset.status === 'BLOCKED') {
      return {
        classification: 'SHADOW',
        recommendation: `Blocked AI asset ${matchedAsset.name} is generating signals. Immediate action required.`,
      };
    }

    if (matchedAsset.status === 'ACTIVE') {
      return {
        classification: 'APPROVED',
        recommendation: `Authorized AI asset ${matchedAsset.name} is operating normally.`,
      };
    }

    return {
      classification: 'UNAPPROVED',
      recommendation: `Asset ${matchedAsset.name} is in status ${matchedAsset.status}. Usage may violate policies.`,
    };
  }

  public static getOrphanedAssets(tenantId: string): AIAsset[] {
    const assets = this.getAssetsByTenant(tenantId);
    return assets.filter(
      (a) =>
        !a.owner.businessOwner ||
        !a.owner.technicalOwner ||
        !a.owner.securityOwner ||
        !a.owner.dataOwner ||
        !a.owner.complianceOwner
    );
  }

  public static getInventoryStats(tenantId: string): {
    total: number;
    byType: Record<string, number>;
    byRisk: Record<string, number>;
    byStatus: Record<string, number>;
    orphaned: number;
  } {
    const assets = this.getAssetsByTenant(tenantId);
    const stats = {
      total: assets.length,
      byType: {} as Record<string, number>,
      byRisk: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      orphaned: this.getOrphanedAssets(tenantId).length,
    };

    for (const a of assets) {
      stats.byType[a.type] = (stats.byType[a.type] || 0) + 1;
      stats.byRisk[a.riskTier] = (stats.byRisk[a.riskTier] || 0) + 1;
      stats.byStatus[a.status] = (stats.byStatus[a.status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Generate an AI Bill of Materials (AI BOM) for an AI asset
   */
  public static generateBillOfMaterials(tenantId: string, assetId: string): {
    bomId: string;
    assetId: string;
    tenantId: string;
    model: { provider: string; modelName: string; version: string };
    promptVersion: string;
    tools: string[];
    knowledgeSources: string[];
    memoryScopes: string[];
    dependencies: string[];
    governingPolicies: string[];
    evaluationSuiteId: string;
    generatedAt: number;
    hash: string;
  } {
    const asset = this.getAsset(tenantId, assetId);
    if (!asset) {
      throw new Error(`Asset '${assetId}' not found for tenant '${tenantId}'`);
    }

    const bomId = `bom_${assetId}_${Date.now()}`;
    const model = {
      provider: asset.provider,
      modelName: asset.name,
      version: asset.version,
    };
    const promptVersion = `prompt_v${asset.version}`;
    const tools = asset.permissions.filter((p) => p.startsWith('tool:')).map((p) => p.replace('tool:', ''));
    const knowledgeSources = asset.dataScope;
    const memoryScopes = ['WORKING', 'TASK', 'ACCOUNT', 'ORGANIZATION'];
    const dependencies = asset.dependencies;
    const governingPolicies = [`pol_tier_${asset.riskTier.toLowerCase()}`, 'pol_tenant_isolation', 'pol_gdpr_dlp'];
    const evaluationSuiteId = `suite_eval_${assetId}`;
    const generatedAt = Date.now();

    const payload = `${bomId}|${assetId}|${tenantId}|${asset.version}|${tools.join(',')}|${dependencies.join(',')}|${generatedAt}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    return {
      bomId,
      assetId,
      tenantId,
      model,
      promptVersion,
      tools,
      knowledgeSources,
      memoryScopes,
      dependencies,
      governingPolicies,
      evaluationSuiteId,
      generatedAt,
      hash,
    };
  }

  /**
   * Scan batch network/telemetry events for shadow AI usage
   */
  public static scanTelemetryForShadowAI(
    tenantId: string,
    signals: Array<{ signalType: string; source: string; endpoint?: string; user?: string }>
  ): Array<{ signal: string; source: string; classification: ShadowAIClassification; recommendation: string }> {
    const results = [];
    for (const sig of signals) {
      const outcome = this.detectShadowAI(tenantId, sig.signalType, sig.source, { endpoint: sig.endpoint, user: sig.user });
      results.push({
        signal: sig.signalType,
        source: sig.source,
        classification: outcome.classification,
        recommendation: outcome.recommendation,
      });
    }
    return results;
  }

  /**
   * Reset store (for tests)
   */
  public static resetStore(): void {
    this.assets.clear();
  }
}
