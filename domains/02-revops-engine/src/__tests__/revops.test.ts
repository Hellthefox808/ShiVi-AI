import { describe, it, expect } from 'vitest';
import { RevOpsEngineDomain } from '../index.js';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi System 02: Autonomous RevOps Engine Domain', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-revops',
    organizationId: 'org-revops',
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

  it('should initialize RevOps domain agent in DRAFT state', () => {
    const agent = RevOpsEngineDomain.initializeDomainAgent(sampleTenant);
    expect(agent.agentId).toBe('revops-analyst-02');
    expect(agent.state).toBe('DRAFT');
  });

  it('should generate revenue forecast successfully', () => {
    const res = RevOpsEngineDomain.generateForecast(sampleTenant, 'Q4-2026');
    expect(res.projectedARRUSD).toBe(12500000);
    expect(res.confidenceScore).toBe(0.92);
  });
});
