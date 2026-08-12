import { describe, it, expect } from 'vitest';
import { ResourcePlanningDomain } from '../index.js';

describe('ShiVi System 18: Resource Planning', () => {
  const domain = new ResourcePlanningDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-18-resource-planning');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
