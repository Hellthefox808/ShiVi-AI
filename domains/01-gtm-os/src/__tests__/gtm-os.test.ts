import { describe, it, expect } from 'vitest';
import { GtmOperatingSystemDomain } from '../index.js';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi System 01: AI GTM Operating System Domain', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-gtm',
    organizationId: 'org-gtm',
    environment: 'staging',
    homeRegion: 'us-east-1',
    policy: {
      allowedRegions: ['us-east-1'],
      maxRetentionDays: 30,
      dataClassificationLimit: 'CONFIDENTIAL',
      customEncryptionKeyRequired: false,
      vectorIsolationEnabled: true,
      agentMemoryIsolationEnabled: true,
    },
  };

  it('should initialize GTM domain agent in DRAFT state', () => {
    const agent = GtmOperatingSystemDomain.initializeDomainAgent(sampleTenant);
    expect(agent.agentId).toBe('gtm-orchestrator-01');
    expect(agent.state).toBe('DRAFT');
  });

  it('should launch GTM campaign successfully', () => {
    const res = GtmOperatingSystemDomain.launchCampaign(sampleTenant, {
      campaignId: 'cmp-101',
      name: 'Q4 Enterprise Launch',
      targetAudience: 'CTOs & VPs of Engineering',
      budgetUSD: 50000,
    });
    expect(res.status).toBe('CAMPAIGN_LAUNCHED');
    expect(res.campaignId).toBe('cmp-101');
  });
});
