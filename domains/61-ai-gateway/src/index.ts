/**
 * ShiVi System 61: ShiVi AI Gateway Domain
 * Standard: FTL 10.61, FSD §10.61, SAD §19
 */

import { ModelRouter, ModelRouteDecision, ModelCostTracker } from '@shivi/ai-sdk';
import { TenancyContext } from '@shivi/kernel';

export interface AiGatewayStatus {
  tenantId: string;
  activeProviders: string[];
  totalSpendUSD: number;
  routingMode: string;
}

export class AiGatewayDomain {
  public static getGatewayStatus(tenancyContext: TenancyContext): AiGatewayStatus {
    return {
      tenantId: tenancyContext.tenantId,
      activeProviders: ['google', 'anthropic', 'openai', 'local'],
      totalSpendUSD: ModelCostTracker.getTenantTotalSpend(tenancyContext.tenantId),
      routingMode: 'DYNAMIC_COST_LATENCY_OPTIMIZED',
    };
  }

  public static routeModelRequest(
    tenancyContext: TenancyContext,
    agentId: string,
    complexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX'
  ): ModelRouteDecision {
    return ModelRouter.selectRoute({
      tenantId: tenancyContext.tenantId,
      agentId,
      taskComplexity: complexity,
    });
  }
}
