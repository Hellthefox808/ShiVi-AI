import { describe, it, expect } from 'vitest';
import { RevOpsService } from '../index.js';

describe('RevOpsService Enterprise Suite', () => {
  const service = new RevOpsService();

  it('should compute pipeline velocity and conversion bottlenecks', async () => {
    const analytics = await service.analyzePipelineVelocity('tenant_revops');
    expect(analytics.velocityUSDPerDay).toBeGreaterThan(0);
    expect(analytics.winRatePct).toBeGreaterThan(0);
    expect(analytics.stages.length).toBeGreaterThanOrEqual(4);
    expect(analytics.totalPipelineUSD).toBeGreaterThan(0);
  });

  it('should calculate Customer Acquisition Cost (CAC) and LTV:CAC ratio', async () => {
    const metrics = await service.getCACAndLTV('tenant_revops');
    expect(metrics.cacUSD).toBeGreaterThan(0);
    expect(metrics.ltvCacRatio).toBeGreaterThan(1);
    expect(metrics.paybackPeriodMonths).toBeDefined();
  });

  it('should assess deal risk and detect stage stagnation & missing buyers', async () => {
    const risk = await service.assessDealRisk('deal_stalled_100k', 34, false, 20);
    expect(risk.isStalled).toBe(true);
    expect(risk.riskScore).toBeGreaterThanOrEqual(70);
    expect(risk.riskLevel).toBe('CRITICAL');
    expect(risk.missingStakeholders).toContain('ECONOMIC_BUYER');
    expect(risk.nextBestAction).toContain('Executive Sponsor');
  });
});

