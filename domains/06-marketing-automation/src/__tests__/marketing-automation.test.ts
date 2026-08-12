import { describe, it, expect } from 'vitest';
import { MarketingAutomationDomain } from '../index.js';

describe('ShiVi System 06: Marketing Automation', () => {
  const domain = new MarketingAutomationDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-06-marketing-automation');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
