import { describe, it, expect } from 'vitest';
import { DocumentIntelligenceDomain } from '../index.js';

describe('ShiVi System 14: Document Intelligence', () => {
  const domain = new DocumentIntelligenceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-14-document-intelligence');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
