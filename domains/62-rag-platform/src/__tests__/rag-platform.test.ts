import { describe, it, expect } from 'vitest';
import { RagPlatformDomain } from '../index.js';

describe('ShiVi System 62: RAG Platform', () => {
  const domain = new RagPlatformDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-62-rag-platform');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
