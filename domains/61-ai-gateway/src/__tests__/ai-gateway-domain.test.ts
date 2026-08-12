import { describe, it, expect } from 'vitest';
import { AiGatewayDomain } from '../index.js';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi System 61: ShiVi AI Gateway Domain', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-gateway',
    organizationId: 'org-gateway',
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

  it('should return gateway status with active providers and routing mode', () => {
    const status = AiGatewayDomain.getGatewayStatus(sampleTenant);
    expect(status.tenantId).toBe('tenant-gateway');
    expect(status.activeProviders).toContain('google');
    expect(status.routingMode).toBe('DYNAMIC_COST_LATENCY_OPTIMIZED');
  });

  it('should route model request based on complexity', () => {
    const route = AiGatewayDomain.routeModelRequest(sampleTenant, 'ag-1', 'COMPLEX');
    expect(route.primaryModel).toBe('gemini-1.5-pro');
  });
});
