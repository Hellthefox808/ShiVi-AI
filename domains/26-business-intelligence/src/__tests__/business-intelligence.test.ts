import { describe, it, expect } from 'vitest';
import { BusinessIntelligenceDomain } from '../index.js';

describe('ShiVi System 26: Business Intelligence', () => {
  const domain = new BusinessIntelligenceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-26-business-intelligence');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
