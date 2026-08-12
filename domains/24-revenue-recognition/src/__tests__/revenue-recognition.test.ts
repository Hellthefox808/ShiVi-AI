import { describe, it, expect } from 'vitest';
import { RevenueRecognitionDomain } from '../index.js';

describe('ShiVi System 24: Revenue Recognition', () => {
  const domain = new RevenueRecognitionDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-24-revenue-recognition');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
