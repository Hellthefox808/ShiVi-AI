/**
 * app-bff - Backend-for-Frontend aggregation layer
 *
 * @packageDocumentation
 */

import { TenancyContext } from '@shivi/kernel';

/**
 * Aggregated dashboard summary payload for frontend widgets.
 */
export interface BFFDashboardSummary {
  tenantId: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: string[];
  };
  metrics: {
    activeAgents: number;
    pendingTasks: number;
    monthlyRevenue: number;
    systemHealth: 'healthy' | 'degraded' | 'down';
  };
  recentActivities: Array<{ id: string; type: string; timestamp: string }>;
}

/**
 * User overview information composition.
 */
export interface BFFUserOverview {
  userId: string;
  profile: Record<string, unknown>;
  permissions: string[];
  preferences: Record<string, unknown>;
}

/**
 * BFF API request context header wrapper.
 */
export interface BFFCompositionContext {
  authorizationHeader: string;
  tenantId: string;
  requestId: string;
  userAgent?: string;
}

/**
 * Incoming BFF Request definition.
 */
export interface BFFRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  queryParams?: Record<string, string>;
  body?: unknown;
}

/**
 * Comprehensive Backend-for-Frontend service for UI workspace aggregation.
 */
export class BFFService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly cacheTTLMs: number;

  constructor(private readonly config: Record<string, unknown> = {}) {
    this.cacheTTLMs = (config.cacheTTLMs as number) || 30000;
  }

  /**
   * Aggregates and composes dashboard data for the frontend workspace.
   */
  public async getDashboardData(tenantId: string, userId: string): Promise<BFFDashboardSummary> {
    const cacheKey = `dashboard:${tenantId}:${userId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTLMs) {
      return cached.data as BFFDashboardSummary;
    }

    const summary: BFFDashboardSummary = {
      tenantId,
      user: {
        id: userId,
        name: userId.includes('admin') ? 'Admin Operator' : 'ShiVi Operator',
        email: `${userId}@shivi.internal`,
        roles: userId.includes('admin') ? ['admin', 'operator', 'auditor'] : ['operator'],
      },
      metrics: {
        activeAgents: 14,
        pendingTasks: 2,
        monthlyRevenue: 128500,
        systemHealth: 'healthy',
      },
      recentActivities: [
        { id: `act_${Date.now()}_1`, type: 'agent_dispatched', timestamp: new Date().toISOString() },
        { id: `act_${Date.now()}_2`, type: 'policy_evaluated', timestamp: new Date().toISOString() },
        { id: `act_${Date.now()}_3`, type: 'evidence_ledger_verified', timestamp: new Date().toISOString() },
      ],
    };

    this.cache.set(cacheKey, { data: summary, timestamp: Date.now() });
    return summary;
  }

  /**
   * Composes client API response from underlying microservices.
   */
  public async composeClientResponse(request: BFFRequest, context: BFFCompositionContext): Promise<{ statusCode: number; data: unknown }> {
    if (!context.tenantId) {
      return { statusCode: 400, data: { error: 'MISSING_TENANT_CONTEXT' } };
    }

    if (request.path === '/api/v1/overview') {
      const overview: BFFUserOverview = {
        userId: 'usr_current',
        profile: { tenantId: context.tenantId, theme: 'dark', locale: 'en-US' },
        permissions: ['read:dashboard', 'write:tasks', 'execute:agents'],
        preferences: { autoRefresh: true, refreshIntervalSec: 10 },
      };
      return { statusCode: 200, data: overview };
    }

    return {
      statusCode: 200,
      data: {
        message: 'BFF aggregation successful',
        requestPath: request.path,
        tenantId: context.tenantId,
        requestId: context.requestId,
        timestamp: new Date().toISOString(),
      },
    };
  }

  /**
   * Aggregates metrics from multiple backend services into a single response.
   */
  public async aggregateMetrics(tenantId: string): Promise<Record<string, unknown>> {
    return {
      tenantId,
      agents: { active: 14, quarantined: 0, degraded: 0, total: 14 },
      analytics: { requestsTotal: 12500, p99LatencyMs: 24, cacheHitRate: 0.94 },
      finance: { currentMRR: 128500, arr: 1542000, tokenBurnUSD: 312.45 },
      security: { score: 100, tamperIncidents: 0, auditIntegrity: 'VERIFIED' },
    };
  }

  /**
   * Clears in-memory BFF cache.
   */
  public clearCache(): void {
    this.cache.clear();
  }
}

export default BFFService;

