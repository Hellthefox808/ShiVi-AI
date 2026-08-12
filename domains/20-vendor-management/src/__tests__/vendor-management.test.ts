import { describe, it, expect } from 'vitest';
import { VendorManagementDomain } from '../index.js';

describe('ShiVi System 20: Vendor Management', () => {
  const domain = new VendorManagementDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-20-vendor-management');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
