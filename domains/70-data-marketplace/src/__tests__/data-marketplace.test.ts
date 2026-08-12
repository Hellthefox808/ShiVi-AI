import { describe, it, expect } from 'vitest';
import { DataMarketplaceDomain } from '../index.js';

describe('ShiVi System 70: Data Marketplace', () => {
  const domain = new DataMarketplaceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-70-data-marketplace');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
