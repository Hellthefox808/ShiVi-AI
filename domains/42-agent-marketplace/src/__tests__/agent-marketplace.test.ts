import { describe, it, expect } from 'vitest';
import { AgentMarketplaceDomain } from '../index.js';

describe('ShiVi System 42: Agent Marketplace', () => {
  const domain = new AgentMarketplaceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-42-agent-marketplace');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
