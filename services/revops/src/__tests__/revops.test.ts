import { describe, it, expect } from 'vitest';
import { RevOpsService } from '../index.js';

describe('RevOpsService Enterprise Suite', () => {
  const service = new RevOpsService();

  it('should compute pipeline velocity and conversion bottlenecks', async () => {
    const analytics = await service.analyzePipelineVelocity('tenant_revops');
    expect(analytics.velocityUSDPerDay).toBeGreaterThan(0);
    expect(analytics.winRatePct).toBeGreaterThan(0);
  });

  it('should calculate Customer Acquisition Cost (CAC) and LTV:CAC ratio', async () => {
    const metrics = await service.getCACAndLTV('tenant_revops');
    expect(metrics.cacUSD).toBeGreaterThan(0);
    expect(metrics.ltvCacRatio).toBeGreaterThan(1);
  });
});
