import { describe, it, expect } from 'vitest';
import { AgentControlPlaneDomain } from '../index.js';
import { AgentLifecycleManager } from '@shivi/agent-runtime';
import { TenancyContext } from '@shivi/kernel';

describe('ShiVi System 41: Agent Control Plane Domain', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-cp',
    organizationId: 'org-cp',
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

  it('should audit fleet health across active and quarantined agents', () => {
    const ag1 = AgentLifecycleManager.registerAgent('ag-1', 'v1', 'tenant-cp', 'A1', 'Desc', [], 'T0');
    AgentLifecycleManager.transitionState('tenant-cp', 'ag-1', 'v1', 'EVALUATING');
    AgentLifecycleManager.transitionState('tenant-cp', 'ag-1', 'v1', 'SECURITY_REVIEW');
    AgentLifecycleManager.transitionState('tenant-cp', 'ag-1', 'v1', 'STAGING');
    AgentLifecycleManager.transitionState('tenant-cp', 'ag-1', 'v1', 'CANARY');

    const ag2 = AgentLifecycleManager.registerAgent('ag-2', 'v1', 'tenant-cp', 'A2', 'Desc', [], 'T0');
    AgentLifecycleManager.transitionState('tenant-cp', 'ag-2', 'v1', 'QUARANTINED', 'Attack detected');

    const health = AgentControlPlaneDomain.auditFleetHealth('tenant-cp', [ag1, ag2]);
    expect(health.totalAgents).toBe(2);
    expect(health.activeCount).toBe(1);
    expect(health.quarantinedCount).toBe(1);
  });
});
