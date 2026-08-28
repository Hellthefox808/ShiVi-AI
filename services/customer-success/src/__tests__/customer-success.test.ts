import { describe, it, expect } from 'vitest';
import { CustomerSuccessService } from '../index.js';

describe('CustomerSuccessService Enterprise Suite', () => {
  const service = new CustomerSuccessService();

  it('should calculate account health score', async () => {
    const health = await service.getAccountHealth('tenant_cs', 'acc_500');
    expect(health.score).toBeGreaterThanOrEqual(0);
    expect(health.score).toBeLessThanOrEqual(100);
    expect(health.churnRisk).toBeDefined();
  });

  it('should record NPS survey response and compute aggregate', async () => {
    const nps = await service.getNPSReport('tenant_cs');
    expect(nps.npsScore).toBeGreaterThanOrEqual(-100);
    expect(nps.totalResponses).toBeGreaterThan(0);
  });
});
