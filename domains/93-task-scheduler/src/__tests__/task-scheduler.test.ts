import { describe, it, expect } from 'vitest';
import { TaskSchedulerDomain } from '../index.js';

describe('ShiVi System 93: Task Scheduler', () => {
  const domain = new TaskSchedulerDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-93-task-scheduler');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
