/**
 * ShiVi X100+ Kernel — Tenancy & Isolation Primitives
 * Standard: SAD v2.0 §7.1, TDA v1.1 §12, FTL-KER-001
 */

export type DataClassification = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface TenantPolicy {
  allowedRegions: string[];
  maxRetentionDays: number;
  dataClassificationLimit: DataClassification;
  customEncryptionKeyRequired: boolean;
  vectorIsolationEnabled: boolean;
  agentMemoryIsolationEnabled: boolean;
}

export interface TenancyContext {
  tenantId: string;
  organizationId: string;
  environment: 'local' | 'dev' | 'test' | 'staging' | 'canary' | 'production' | 'research' | 'high-assurance';
  homeRegion: string;
  policy: TenantPolicy;
}

export class TenancyViolationError extends Error {
  constructor(
    public readonly sourceTenantId: string,
    public readonly targetTenantId: string,
    public readonly resourceType: string,
    message?: string
  ) {
    super(message ?? `Cross-tenant violation: Tenant '${sourceTenantId}' attempted access to '${targetTenantId}' resource (${resourceType}).`);
    this.name = 'TenancyViolationError';
  }
}

export class TenancyManager {
  private static contextStorage = new Map<string, TenancyContext>();

  /**
   * Register or initialize a tenant context
   */
  public static registerTenant(context: TenancyContext): void {
    if (!context.tenantId || !context.organizationId) {
      throw new Error('Tenant registration failed: tenantId and organizationId are required.');
    }
    this.contextStorage.set(context.tenantId, context);
  }

  /**
   * Retrieve active tenant context
   */
  public static getTenant(tenantId: string): TenancyContext | undefined {
    return this.contextStorage.get(tenantId);
  }

  /**
   * Validate strict tenant boundary isolation between request context and resource target
   */
  public static assertTenantMatch(
    requestTenantId: string,
    resourceTenantId: string,
    resourceType: string
  ): void {
    if (requestTenantId !== resourceTenantId) {
      throw new TenancyViolationError(requestTenantId, resourceTenantId, resourceType);
    }
  }

  /**
   * Build tenant-scoped cache or storage key prefix
   */
  public static buildTenantScopedKey(tenantId: string, namespace: string, key: string): string {
    return `tenant:${tenantId}:${namespace}:${key}`;
  }

  /**
   * Validate data classification limits for tenant policy
   */
  public static validateClassificationAccess(
    context: TenancyContext,
    targetClassification: DataClassification
  ): boolean {
    const levels: Record<DataClassification, number> = {
      PUBLIC: 1,
      INTERNAL: 2,
      CONFIDENTIAL: 3,
      RESTRICTED: 4,
    };
    const maxAllowed = levels[context.policy.dataClassificationLimit];
    const requested = levels[targetClassification];
    return requested <= maxAllowed;
  }

  /**
   * Assert vector isolation enforcement for tenant
   */
  public static assertVectorIsolation(requestTenantId: string, resourceTenantId: string): void {
    if (requestTenantId !== resourceTenantId) {
      throw new TenancyViolationError(requestTenantId, resourceTenantId, 'VectorEmbedding');
    }
  }

  /**
   * Assert agent memory isolation enforcement for tenant
   */
  public static assertMemoryIsolation(requestTenantId: string, resourceTenantId: string): void {
    if (requestTenantId !== resourceTenantId) {
      throw new TenancyViolationError(requestTenantId, resourceTenantId, 'AgentMemory');
    }
  }
}

