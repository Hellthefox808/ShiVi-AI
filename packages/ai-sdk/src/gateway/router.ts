/**
 * ShiVi X100+ AI SDK — Model Router & Multi-Provider Gateway
 * Standard: SAD v2.0 §20, TDA v1.1 §62
 */

import { ModelCostTracker } from './cost.js';

export type TaskComplexity = 'SIMPLE' | 'MEDIUM' | 'COMPLEX';

export interface RouteRequest {
  tenantId: string;
  agentId: string;
  taskComplexity: TaskComplexity;
  maxLatencyMs?: number;
  privacyRestricted?: boolean;
}

export interface ModelRouteDecision {
  primaryModel: string;
  fallbackModel: string;
  estimatedCostPer1k: number;
  reason: string;
}

export class ModelRouter {
  /**
   * Select optimal model based on task parameters and tenant governance policies
   */
  public static selectRoute(request: RouteRequest): ModelRouteDecision {
    // 1. Privacy Restricted workloads route to local / private models
    if (request.privacyRestricted) {
      return {
        primaryModel: 'ollama-llama3',
        fallbackModel: 'gemini-1.5-flash',
        estimatedCostPer1k: 0,
        reason: 'Privacy-restricted workload routed to local Ollama instance.',
      };
    }

    // 2. Task Complexity Routing Matrix
    switch (request.taskComplexity) {
      case 'SIMPLE':
        return {
          primaryModel: 'gemini-1.5-flash',
          fallbackModel: 'gpt-4o',
          estimatedCostPer1k: ModelCostTracker.calculateCost('gemini-1.5-flash', 1000, 0),
          reason: 'Simple task routed to low-latency, cost-efficient Flash model.',
        };
      case 'MEDIUM':
        return {
          primaryModel: 'claude-3-5-sonnet',
          fallbackModel: 'gemini-1.5-pro',
          estimatedCostPer1k: ModelCostTracker.calculateCost('claude-3-5-sonnet', 1000, 0),
          reason: 'Medium complexity task routed to Sonnet with Gemini 1.5 Pro fallback.',
        };
      case 'COMPLEX':
        return {
          primaryModel: 'gemini-1.5-pro',
          fallbackModel: 'gpt-4o',
          estimatedCostPer1k: ModelCostTracker.calculateCost('gemini-1.5-pro', 1000, 0),
          reason: 'Complex reasoning task routed to high-capability Gemini 1.5 Pro model.',
        };
      default:
        return {
          primaryModel: 'gemini-1.5-flash',
          fallbackModel: 'ollama-llama3',
          estimatedCostPer1k: 0.0001,
          reason: 'Default fallback route.',
        };
    }
  }

  /**
   * Execute model request with multi-provider fallback support
   */
  public static async executeWithFallback<T>(
    route: ModelRouteDecision,
    primaryAction: (model: string) => Promise<T>,
    fallbackAction?: (model: string) => Promise<T>
  ): Promise<{ result: T; modelUsed: string; isFallback: boolean }> {
    try {
      const result = await primaryAction(route.primaryModel);
      return { result, modelUsed: route.primaryModel, isFallback: false };
    } catch (primaryErr) {
      if (fallbackAction) {
        const result = await fallbackAction(route.fallbackModel);
        return { result, modelUsed: route.fallbackModel, isFallback: true };
      }
      throw primaryErr;
    }
  }
}
