import { describe, it, expect } from 'vitest';
import { MarketingService } from '../index.js';

describe('MarketingService Enterprise Suite', () => {
  const service = new MarketingService();

  it('should create and schedule an omni-channel marketing campaign', async () => {
    const campaign = await service.createCampaign({
      tenantId: 'tenant_mkt',
      name: 'Summer AI Summit',
      channels: ['email', 'linkedin', 'webinar'],
      budgetUSD: 35000,
    });
    expect(campaign.campaignId).toBeDefined();
    expect(campaign.status).toBe('scheduled');
  });

  it('should track conversion metrics', async () => {
    const metrics = await service.getCampaignMetrics('cmp_101');
    expect(metrics.impressions).toBeGreaterThan(0);
    expect(metrics.conversions).toBeGreaterThan(0);
  });
});
