/**
 * ShiVi X100+ AI SDK — FinOps & Cost Tracker
 * Standard: SAD v2.0 §45, TDA v1.1 §74
 */

export interface ModelPricing {
  provider: string;
  model: string;
  inputCostPer1kTokens: number;
  outputCostPer1kTokens: number;
}

export interface UsageRecord {
  tenantId: string;
  agentId: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  timestamp: number;
}

export class ModelCostTracker {
  private static pricingCatalog: Record<string, ModelPricing> = {
    'gemini-1.5-pro': { provider: 'google', model: 'gemini-1.5-pro', inputCostPer1kTokens: 0.00125, outputCostPer1kTokens: 0.005 },
    'gemini-1.5-flash': { provider: 'google', model: 'gemini-1.5-flash', inputCostPer1kTokens: 0.000075, outputCostPer1kTokens: 0.0003 },
    'claude-3-5-sonnet': { provider: 'anthropic', model: 'claude-3-5-sonnet', inputCostPer1kTokens: 0.003, outputCostPer1kTokens: 0.015 },
    'gpt-4o': { provider: 'openai', model: 'gpt-4o', inputCostPer1kTokens: 0.0025, outputCostPer1kTokens: 0.01 },
    'ollama-llama3': { provider: 'local', model: 'ollama-llama3', inputCostPer1kTokens: 0, outputCostPer1kTokens: 0 },
  };

  private static usageLedger: UsageRecord[] = [];
  private static tenantBudgetsUSD = new Map<string, number>();

  /**
   * Set monthly budget limit for a tenant
   */
  public static setTenantBudget(tenantId: string, budgetUSD: number): void {
    this.tenantBudgetsUSD.set(tenantId, budgetUSD);
  }

  /**
   * Calculate exact USD cost for token usage
   */
  public static calculateCost(modelKey: string, promptTokens: number, completionTokens: number): number {
    const pricing = this.pricingCatalog[modelKey] || {
      provider: 'generic',
      model: modelKey,
      inputCostPer1kTokens: 0.001,
      outputCostPer1kTokens: 0.003,
    };

    const inputCost = (promptTokens / 1000) * pricing.inputCostPer1kTokens;
    const outputCost = (completionTokens / 1000) * pricing.outputCostPer1kTokens;
    return Number((inputCost + outputCost).toFixed(6));
  }

  /**
   * Track token usage and assert budget limits
   */
  public static recordUsage(
    tenantId: string,
    agentId: string,
    modelKey: string,
    promptTokens: number,
    completionTokens: number
  ): UsageRecord {
    const costUSD = this.calculateCost(modelKey, promptTokens, completionTokens);
    const now = Date.now();

    const record: UsageRecord = {
      tenantId,
      agentId,
      provider: this.pricingCatalog[modelKey]?.provider || 'generic',
      model: modelKey,
      promptTokens,
      completionTokens,
      costUSD,
      timestamp: now,
    };

    // Check if total tenant spend exceeds monthly budget limit
    const currentTotalSpend = this.getTenantTotalSpend(tenantId);
    const budget = this.tenantBudgetsUSD.get(tenantId);
    if (budget !== undefined && currentTotalSpend + costUSD > budget) {
      throw new Error(`Tenant '${tenantId}' exceeded monthly AI budget limit ($${budget} USD). Spend: $${(currentTotalSpend + costUSD).toFixed(2)} USD`);
    }

    this.usageLedger.push(record);
    return record;
  }

  /**
   * Calculate cumulative USD spend for tenant
   */
  public static getTenantTotalSpend(tenantId: string): number {
    return this.usageLedger
      .filter((u) => u.tenantId === tenantId)
      .reduce((sum, u) => sum + u.costUSD, 0);
  }

  /**
   * Reset cost tracking ledger (for test isolation)
   */
  public static resetLedger(): void {
    this.usageLedger = [];
    this.tenantBudgetsUSD.clear();
  }
}
