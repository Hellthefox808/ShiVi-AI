import { describe, it, expect } from 'vitest';
import { ExpenseManagementDomain } from '../index.js';

describe('ShiVi System 22: Expense Management', () => {
  const domain = new ExpenseManagementDomain({
    tenantId: 'test-tenant',
    enabled: true,
    features: {},
  });

  it('should return healthy status', () => {
    const health = domain.getHealth();
    expect(health.status).toBe('healthy');
  });

  it('should return correct domain ID', () => {
    expect(domain.getDomainId()).toBe('system-22-expense-management');
  });

  it('should report enabled state', () => {
    expect(domain.isEnabled()).toBe(true);
  });
});
