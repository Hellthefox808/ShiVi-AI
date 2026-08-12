import { describe, it, expect } from 'vitest';
import { ThreatDetectionDomain } from '../index.js';

describe('ShiVi System 52: Threat Detection', () => {
  const domain = new ThreatDetectionDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-52-threat-detection');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
