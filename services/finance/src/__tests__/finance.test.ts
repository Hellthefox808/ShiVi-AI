import { describe, it, expect } from 'vitest';
import { FinanceService } from '../index.js';

describe('FinanceService Enterprise Suite', () => {
  const service = new FinanceService();

  it('should record double-entry ledger transactions', async () => {
    const tx = await service.recordTransaction({
      tenantId: 'tenant_fin',
      debitAccount: '1000-Cash',
      creditAccount: '4000-SubscriptionRevenue',
      amountUSD: 50000,
      currency: 'USD',
      reference: 'INV-2026-001',
    });
    expect(tx.transactionId).toBeDefined();
    expect(tx.status).toBe('posted');
  });

  it('should generate financial balance summary', async () => {
    const summary = await service.getBalanceSummary('tenant_fin');
    expect(summary.totalAssets).toBeGreaterThan(0);
    expect(summary.totalRevenue).toBeGreaterThan(0);
  });
});
