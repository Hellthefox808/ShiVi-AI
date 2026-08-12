import { describe, it, expect } from 'vitest';
import { MeetingIntelligenceDomain } from '../index.js';

describe('ShiVi System 16: Meeting Intelligence', () => {
  const domain = new MeetingIntelligenceDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-16-meeting-intelligence');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
