import { describe, it, expect } from 'vitest';
import { EmailIntelligenceDomain } from '../index.js';

describe('ShiVi System 15: Email Intelligence', () => {
  const domain = new EmailIntelligenceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-15-email-intelligence');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
