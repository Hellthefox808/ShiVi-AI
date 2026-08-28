import { describe, it, expect } from 'vitest';
import { TenancyService } from '../index.js';

describe('TenancyService Platform Suite', () => {
  const service = new TenancyService();

  it('should provision a new tenant with config and enterprise plan', async () => {
    const tenant = await service.provisionTenant({
      name: 'Acme Enterprise',
      domain: 'acme.shivi.ai',
      planId: 'plan_enterprise_max',
      adminEmail: 'admin@acme.com',
      isolationLevel: 'siloed',
    });
    expect(tenant.tenantId).toBeDefined();
    expect(tenant.name).toBe('Acme Enterprise');
    expect(tenant.isolationLevel).toBe('siloed');
    expect(tenant.plan.features).toContain('sso');
  });

  it('should retrieve tenant configuration', async () => {
    const config = await service.getTenantConfig('tenant_acme');
    expect(config).not.toBeNull();
    expect(config?.tenantId).toBe('tenant_acme');
  });

  it('should update tenant plan subscription', async () => {
    const updated = await service.updatePlan('tenant_acme', 'plan_scale');
    expect(updated).toBe(true);
  });
});
