/**
 * ShiVi X100+ Data Platform — Synthetic Enterprise Generator
 * Standard: SAD v2.0 §50, TDA v1.1 §72, FTL System 72
 */

import { DatabaseSchemaRepository, TenantRecord, UserRecord } from './schema.js';

export interface SyntheticEnterpriseResult {
  tenant: TenantRecord;
  users: UserRecord[];
  generatedAt: number;
}

export class SyntheticEnterpriseGenerator {
  /**
   * Generate a complete synthetic multi-tenant enterprise dataset
   */
  public static generateEnterprise(
    enterpriseName: string,
    environment: 'test' | 'staging' | 'research' = 'test',
    userCount: number = 5
  ): SyntheticEnterpriseResult {
    const tenantId = `tenant_syn_${Math.random().toString(36).substring(2, 8)}`;
    const organizationId = `org_syn_${Math.random().toString(36).substring(2, 8)}`;
    const now = Date.now();

    const tenant: TenantRecord = {
      tenantId,
      name: enterpriseName,
      organizationId,
      environment,
      homeRegion: 'us-east-1',
      createdAt: now,
    };

    DatabaseSchemaRepository.createTenant(tenant);

    const roles = ['admin', 'sales', 'marketing', 'support', 'finance', 'engineer'];
    const users: UserRecord[] = [];

    for (let i = 0; i < userCount; i++) {
      const role = roles[i % roles.length];
      const user: UserRecord = {
        userId: `usr_${tenantId}_${i + 1}`,
        tenantId,
        email: `user${i + 1}@${enterpriseName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
        fullName: `Synthetic User ${i + 1}`,
        role,
        createdAt: now,
      };

      DatabaseSchemaRepository.createUser(user);
      users.push(user);
    }

    return {
      tenant,
      users,
      generatedAt: now,
    };
  }
}
