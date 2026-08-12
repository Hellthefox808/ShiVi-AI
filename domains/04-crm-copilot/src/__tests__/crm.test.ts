import { describe, it, expect } from 'vitest';
import { CrmCopilotDomain } from '../index.js';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi System 04: AI CRM Copilot Domain', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-crm',
    organizationId: 'org-crm',
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

  it('should initialize CRM domain agent in DRAFT state', () => {
    const agent = CrmCopilotDomain.initializeDomainAgent(sampleTenant);
    expect(agent.agentId).toBe('crm-copilot-04');
    expect(agent.state).toBe('DRAFT');
  });

  it('should evaluate account deal health score', () => {
    const score = CrmCopilotDomain.evaluateAccountDeal(sampleTenant, 'acc-101', 'Wayne Enterprises');
    expect(score.healthScore).toBe(88);
    expect(score.churnRisk).toBe('LOW');
    expect(score.recommendedActions.length).toBeGreaterThan(0);
  });
});
