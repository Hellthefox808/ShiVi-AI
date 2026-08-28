/**
 * service-tenancy - Tenant provisioning, isolation, plans
 *
 * @packageDocumentation
 */

export type TenantIsolationLevel = 'shared' | 'siloed' | 'hybrid';

export interface TenantPlan {
  planId: string;
  name: string;
  maxUsers: number;
  maxStorageGb: number;
  features: string[];
}

export interface TenantConfig {
  tenantId: string;
  name: string;
  domain: string;
  isolationLevel: TenantIsolationLevel;
  plan: TenantPlan;
  createdAt: Date;
}

export interface ProvisioningRequest {
  name: string;
  domain: string;
  planId: string;
  adminEmail: string;
  isolationLevel?: TenantIsolationLevel;
}

export class TenancyService {
  private tenants = new Map<string, TenantConfig>();

  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async provisionTenant(request: ProvisioningRequest): Promise<TenantConfig> {
    const tenantId = 'ten_' + Math.random().toString(36).substring(2, 9);
    const tenant: TenantConfig = {
      tenantId,
      name: request.name,
      domain: request.domain,
      isolationLevel: request.isolationLevel || 'shared',
      plan: {
        planId: request.planId,
        name: 'Enterprise Tier',
        maxUsers: 100,
        maxStorageGb: 500,
        features: ['sso', 'custom_domain', 'audit_logs'],
      },
      createdAt: new Date(),
    };
    this.tenants.set(tenantId, tenant);
    return tenant;
  }

  public async getTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    if (this.tenants.has(tenantId)) {
      return this.tenants.get(tenantId)!;
    }
    return {
      tenantId,
      name: 'Acme Corp',
      domain: 'acme.shivi.ai',
      isolationLevel: 'shared',
      plan: {
        planId: 'plan_enterprise',
        name: 'Enterprise',
        maxUsers: 100,
        maxStorageGb: 500,
        features: ['sso', 'pgvector', 'audit_logs'],
      },
      createdAt: new Date(),
    };
  }

  public async updatePlan(tenantId: string, newPlanId: string): Promise<boolean> {
    const existing = await this.getTenantConfig(tenantId);
    if (existing) {
      existing.plan.planId = newPlanId;
      this.tenants.set(tenantId, existing);
    }
    return true;
  }
}

export default TenancyService;
