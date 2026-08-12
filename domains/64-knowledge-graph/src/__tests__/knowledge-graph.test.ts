import { describe, it, expect } from 'vitest';
import { KnowledgeGraphDomain } from '../index.js';

describe('ShiVi System 64: Knowledge Graph', () => {
  const domain = new KnowledgeGraphDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-64-knowledge-graph');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
