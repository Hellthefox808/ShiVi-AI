import { describe, it, expect } from 'vitest';
import { PipelineIntelligenceDomain } from '../index.js';

describe('ShiVi System 03: Pipeline Intelligence', () => {
  const domain = new PipelineIntelligenceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-03-pipeline-intelligence');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
