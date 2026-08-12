/**
 * ShiVi System 25: AI FinOps & Token Cost Management Engine
 * Standard: SAD v2.0 §45, TDA v1.1 §74, FTL System 25
 */

import { ModelCostTracker } from '@shivi/ai-sdk';
import { Logger } from '@shivi/telemetry';

export interface FinOpsAuditReport {
  tenantId: string;
  monthlyBudgetUSD?: number;
  currentSpendUSD: number;
  budgetUtilizationPct: number;
  recommendations: string[];
  auditedAt: number;
}

export class AIFinOpsDomainEngine {
  /**
   * Run FinOps audit report for a tenant
   */
  public static generateTenantFinOpsReport(tenantId: string, monthlyBudgetUSD?: number): FinOpsAuditReport {
    if (monthlyBudgetUSD !== undefined) {
      ModelCostTracker.setTenantBudget(tenantId, monthlyBudgetUSD);
    }

    const currentSpendUSD = ModelCostTracker.getTenantTotalSpend(tenantId);
    const utilization = monthlyBudgetUSD && monthlyBudgetUSD > 0
      ? Number(((currentSpendUSD / monthlyBudgetUSD) * 100).toFixed(2))
      : 0;

    const recommendations: string[] = [];
    if (utilization > 80) {
      recommendations.push('High spend warning: Tenant budget utilization exceeds 80%. Consider switching SIMPLE tasks to Flash model.');
    } else {
      recommendations.push('Spend profile is nominal. Model cost efficiency is within acceptable parameters.');
    }

    Logger.info(`[System 25: AI FinOps] Generated audit report for tenant '${tenantId}': $${currentSpendUSD} USD (${utilization}%)`);

    return {
      tenantId,
      monthlyBudgetUSD,
      currentSpendUSD,
      budgetUtilizationPct: utilization,
      recommendations,
      auditedAt: Date.now(),
    };
  }
}
