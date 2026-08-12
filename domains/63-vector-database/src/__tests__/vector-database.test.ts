import { describe, it, expect } from 'vitest';
import { VectorDatabaseDomain } from '../index.js';

describe('ShiVi System 63: Vector Database', () => {
  const domain = new VectorDatabaseDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-63-vector-database');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
