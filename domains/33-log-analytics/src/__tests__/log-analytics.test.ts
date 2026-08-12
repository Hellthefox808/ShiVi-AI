import { describe, it, expect } from 'vitest';
import { LogAnalyticsDomain } from '../index.js';

describe('ShiVi System 33: Log Analytics', () => {
  const domain = new LogAnalyticsDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-33-log-analytics');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
