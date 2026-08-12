import { describe, it, expect } from 'vitest';
import { PayrollBenefitsDomain } from '../index.js';

describe('ShiVi System 76: Payroll & Benefits', () => {
  const domain = new PayrollBenefitsDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-76-payroll-benefits');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
