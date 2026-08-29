/**
 * ShiVi AI Governance Fabric — Model Card Registry
 * Documents every model's purpose, capabilities, limitations, risks,
 * evaluation results, and operational parameters.
 */

export type ModelCardStatus =
  | 'DRAFT'
  | 'REVIEWED'
  | 'APPROVED'
  | 'ACTIVE'
  | 'DEPRECATED'
  | 'RETIRED';

export type ModelCapability =
  | 'TEXT_GENERATION'
  | 'CLASSIFICATION'
  | 'EMBEDDING'
  | 'RERANKING'
  | 'STRUCTURED_OUTPUT'
  | 'TOOL_USE'
  | 'VISION'
  | 'AUDIO'
  | 'CODE_GENERATION';

export interface ModelCard {
  modelId: string;
  tenantId: string;
  provider: string;
  modelName: string;
  version: string;
  status: ModelCardStatus;
  purpose: string;
  capabilities: ModelCapability[];
  limitations: string[];
  knownFailureModes: string[];
  riskTier: string;
  dataConsiderations: string[];
  contextCapacity: number;
  toolSupport: boolean;
  structuredOutputSupport: boolean;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  averageLatencyMs: number;
  region: string;
  dataPolicy: string;
  evaluationResults: Array<{ suiteId: string; score: number; passedAt: number }>;
  owner: string;
  approvedBy?: string;
  approvedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export class ModelCardRegistry {
  private static cards = new Map<string, ModelCard>();

  private static getKey(tenantId: string, modelId: string): string {
    return `${tenantId}:${modelId}`;
  }

  public static registerModelCard(
    card: Omit<ModelCard, 'createdAt' | 'updatedAt'>
  ): ModelCard {
    const key = this.getKey(card.tenantId, card.modelId);
    const now = Date.now();
    const newCard: ModelCard = {
      ...card,
      createdAt: now,
      updatedAt: now,
    };
    this.cards.set(key, newCard);
    return newCard;
  }

  public static getModelCard(tenantId: string, modelId: string): ModelCard | undefined {
    return this.cards.get(this.getKey(tenantId, modelId));
  }

  public static listModelCards(tenantId: string): ModelCard[] {
    const result: ModelCard[] = [];
    for (const card of this.cards.values()) {
      if (card.tenantId === tenantId) {
        result.push(card);
      }
    }
    return result;
  }

  public static approveModelCard(
    tenantId: string,
    modelId: string,
    approvedBy: string
  ): ModelCard {
    const card = this.getModelCard(tenantId, modelId);
    if (!card) throw new Error('Model card not found');
    if (card.status !== 'REVIEWED') {
      throw new Error('Model card must be in REVIEWED status to be approved');
    }
    
    card.status = 'APPROVED';
    card.approvedBy = approvedBy;
    card.approvedAt = Date.now();
    card.updatedAt = Date.now();
    return card;
  }

  public static validateModelForTask(
    tenantId: string,
    modelId: string,
    requiredCapabilities: ModelCapability[],
    maxCostPer1kTokens?: number
  ): { suitable: boolean; missingCapabilities: ModelCapability[]; costExceeded: boolean; reason: string } {
    const card = this.getModelCard(tenantId, modelId);
    if (!card) {
      return { suitable: false, missingCapabilities: requiredCapabilities, costExceeded: false, reason: 'Model not found' };
    }

    const missing = requiredCapabilities.filter((c) => !card.capabilities.includes(c));
    let costExceeded = false;
    if (maxCostPer1kTokens !== undefined) {
      if (card.costPer1kInputTokens > maxCostPer1kTokens || card.costPer1kOutputTokens > maxCostPer1kTokens) {
        costExceeded = true;
      }
    }

    const suitable = missing.length === 0 && !costExceeded;
    let reason = suitable ? 'Model meets all criteria' : 'Model does not meet criteria';
    if (missing.length > 0) reason += `: missing capabilities [${missing.join(', ')}]`;
    if (costExceeded) reason += `: exceeds cost threshold`;

    return { suitable, missingCapabilities: missing, costExceeded, reason };
  }

  public static compareModels(
    tenantId: string,
    modelIdA: string,
    modelIdB: string
  ): { recommendation: string; comparison: Record<string, { a: unknown; b: unknown }> } {
    const cardA = this.getModelCard(tenantId, modelIdA);
    const cardB = this.getModelCard(tenantId, modelIdB);

    if (!cardA || !cardB) {
      throw new Error('One or both models not found');
    }

    const comparison: Record<string, { a: unknown; b: unknown }> = {
      costInput: { a: cardA.costPer1kInputTokens, b: cardB.costPer1kInputTokens },
      costOutput: { a: cardA.costPer1kOutputTokens, b: cardB.costPer1kOutputTokens },
      latency: { a: cardA.averageLatencyMs, b: cardB.averageLatencyMs },
      context: { a: cardA.contextCapacity, b: cardB.contextCapacity },
      capabilities: { a: cardA.capabilities, b: cardB.capabilities },
      riskTier: { a: cardA.riskTier, b: cardB.riskTier },
    };

    let recommendation = '';
    if (cardA.costPer1kInputTokens < cardB.costPer1kInputTokens && cardA.averageLatencyMs < cardB.averageLatencyMs) {
      recommendation = `Model A (${cardA.modelName}) is more cost-effective and faster.`;
    } else if (cardB.costPer1kInputTokens < cardA.costPer1kInputTokens && cardB.averageLatencyMs < cardA.averageLatencyMs) {
      recommendation = `Model B (${cardB.modelName}) is more cost-effective and faster.`;
    } else {
      recommendation = `Trade-offs exist between cost and performance for these models.`;
    }

    return { recommendation, comparison };
  }

  public static getModelsByCapability(tenantId: string, capability: ModelCapability): ModelCard[] {
    return this.listModelCards(tenantId).filter((c) => c.capabilities.includes(capability));
  }

  public static deprecateModel(tenantId: string, modelId: string, reason: string): ModelCard {
    const card = this.getModelCard(tenantId, modelId);
    if (!card) throw new Error('Model card not found');
    
    card.status = 'DEPRECATED';
    card.updatedAt = Date.now();
    card.limitations.push(`DEPRECATED: ${reason}`);
    return card;
  }

  public static bootstrapDefaultModels(tenantId: string): void {
    const defaultCards: Array<Omit<ModelCard, 'createdAt' | 'updatedAt'>> = [
      {
        modelId: 'gemini-1.5-pro',
        tenantId,
        provider: 'Google Vertex AI',
        modelName: 'Gemini 1.5 Pro',
        version: '002',
        status: 'ACTIVE',
        purpose: 'Complex reasoning, multi-turn B2B orchestration, deal strategy synthesis',
        capabilities: ['TEXT_GENERATION', 'STRUCTURED_OUTPUT', 'TOOL_USE', 'CODE_GENERATION', 'VISION'],
        limitations: ['Higher latency on massive token contexts (>500k tokens)'],
        knownFailureModes: ['Over-hedging on edge case policy conflicts'],
        riskTier: 'T2',
        dataConsiderations: ['Zero training on customer enterprise data under SOC2 agreement'],
        contextCapacity: 2000000,
        toolSupport: true,
        structuredOutputSupport: true,
        costPer1kInputTokens: 0.00125,
        costPer1kOutputTokens: 0.005,
        averageLatencyMs: 820,
        region: 'us-central1',
        dataPolicy: 'ENTERPRISE_PRIVATE',
        evaluationResults: [{ suiteId: 'eval_pro_golden', score: 96.4, passedAt: Date.now() }],
        owner: 'AI Platform Engineering',
      },
      {
        modelId: 'gemini-1.5-flash',
        tenantId,
        provider: 'Google Vertex AI',
        modelName: 'Gemini 1.5 Flash',
        version: '002',
        status: 'ACTIVE',
        purpose: 'High-throughput qualification, rapid triage, routing, classification',
        capabilities: ['TEXT_GENERATION', 'CLASSIFICATION', 'STRUCTURED_OUTPUT', 'TOOL_USE'],
        limitations: ['Limited complex multi-step reasoning compared to Pro'],
        knownFailureModes: ['Occasional hallucination on sparse unstructured financial tables'],
        riskTier: 'T1',
        dataConsiderations: ['Ephemeral caching, zero retention'],
        contextCapacity: 1000000,
        toolSupport: true,
        structuredOutputSupport: true,
        costPer1kInputTokens: 0.000075,
        costPer1kOutputTokens: 0.0003,
        averageLatencyMs: 195,
        region: 'us-central1',
        dataPolicy: 'ENTERPRISE_PRIVATE',
        evaluationResults: [{ suiteId: 'eval_flash_golden', score: 92.1, passedAt: Date.now() }],
        owner: 'AI Platform Engineering',
      },
      {
        modelId: 'claude-3-5-sonnet',
        tenantId,
        provider: 'Anthropic Bedrock',
        modelName: 'Claude 3.5 Sonnet',
        version: '20241022',
        status: 'ACTIVE',
        purpose: 'Deep research, SEC filing analysis, nuanced communication drafting',
        capabilities: ['TEXT_GENERATION', 'STRUCTURED_OUTPUT', 'TOOL_USE', 'CODE_GENERATION'],
        limitations: ['Rate limits during peak enterprise hours'],
        knownFailureModes: ['Overly polite tone in executive notifications'],
        riskTier: 'T2',
        dataConsiderations: ['Zero data retention, HIPAA/SOC2 compliant'],
        contextCapacity: 200000,
        toolSupport: true,
        structuredOutputSupport: true,
        costPer1kInputTokens: 0.003,
        costPer1kOutputTokens: 0.015,
        averageLatencyMs: 650,
        region: 'us-east-1',
        dataPolicy: 'ENTERPRISE_PRIVATE',
        evaluationResults: [{ suiteId: 'eval_sonnet_golden', score: 95.8, passedAt: Date.now() }],
        owner: 'GTM Platform Team',
      },
    ];

    for (const card of defaultCards) {
      if (!this.getModelCard(tenantId, card.modelId)) {
        this.registerModelCard(card);
      }
    }
  }

  public static resetStore(): void {
    this.cards.clear();
  }
}
