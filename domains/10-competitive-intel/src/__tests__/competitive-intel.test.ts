import { describe, it, expect } from 'vitest';
import { CompetitiveIntelDomain } from '../index.js';

describe('ShiVi System 10: Competitive Intelligence', () => {
  const domain = new CompetitiveIntelDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-10-competitive-intel');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
