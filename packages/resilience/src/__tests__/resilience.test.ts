import { describe, it, expect } from 'vitest';
import {
  AgentRecoveryStateMachine,
  ContextSafetyPipeline,
  TenantIsolationVerifier,
  CanaryReplayGates,
  SystemDegradationManager,
  EdgeReadinessScorer,
} from '../index.js';
import { AgentLifecycleManager } from '@shivi/agent-runtime';
import { TenancyManager, TenancyContext } from '@shivi/kernel';

describe('ShiVi Resilience, Recovery & Readiness Framework Suite', () => {
  const tenantA: TenancyContext = {
    tenantId: 'tenant-res-a',
    organizationId: 'org-res-a',
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

  const tenantB: TenancyContext = {
    ...tenantA,
    tenantId: 'tenant-res-b',
    organizationId: 'org-res-b',
  };

  TenancyManager.registerTenant(tenantA);
  TenancyManager.registerTenant(tenantB);

  it('should detect reasoning loop and auto-quarantine agent', () => {
    AgentLifecycleManager.registerAgent('ag-loop-01', 'v1', 'tenant-res-a', 'Loop Bot', 'Desc', [], 'T1');
    AgentLifecycleManager.transitionState('tenant-res-a', 'ag-loop-01', 'v1', 'EVALUATING');
    AgentLifecycleManager.transitionState('tenant-res-a', 'ag-loop-01', 'v1', 'SECURITY_REVIEW');
    AgentLifecycleManager.transitionState('tenant-res-a', 'ag-loop-01', 'v1', 'STAGING');
    AgentLifecycleManager.transitionState('tenant-res-a', 'ag-loop-01', 'v1', 'CANARY');
    AgentLifecycleManager.transitionState('tenant-res-a', 'ag-loop-01', 'v1', 'ACTIVE');

    const trajectory = [
      { stepIndex: 1, thoughtHash: 'hash-abc', thoughtText: 'Repeating thought' },
      { stepIndex: 2, thoughtHash: 'hash-abc', thoughtText: 'Repeating thought' },
      { stepIndex: 3, thoughtHash: 'hash-abc', thoughtText: 'Repeating thought' },
    ];

    const audit = AgentRecoveryStateMachine.auditTrajectory('tenant-res-a', 'ag-loop-01', 'v1', trajectory);
    expect(audit.recoveryStatus).toBe('LOOP_DETECTED');

    const quarantined = AgentLifecycleManager.getAgent('tenant-res-a', 'ag-loop-01', 'v1');
    expect(quarantined?.state).toBe('QUARANTINED');
  });

  it('should audit citation integrity and detect unverified claims', () => {
    const validHashes = new Map<string, string>([['chk-101', 'hash-valid-123']]);
    const res = ContextSafetyPipeline.auditCitationIntegrity(
      [
        { claimText: 'Valid claim', sourceChunkId: 'chk-101', sourceChunkHash: 'hash-valid-123' },
        { claimText: 'Fake claim', sourceChunkId: 'chk-102', sourceChunkHash: 'hash-fake-999' },
      ],
      validHashes
    );

    expect(res.valid).toBe(false);
    expect(res.unverifiedClaimsCount).toBe(1);
    expect(res.invalidCitations[0].sourceChunkId).toBe('chk-102');
  });

  it('should run tenant boundary isolation audit and pass all gates', () => {
    const audit = TenantIsolationVerifier.runIsolationAudit('tenant-res-a', 'tenant-res-b');
    expect(audit.passedAllGates).toBe(true);
    expect(audit.crossTenantReadBlocked).toBe(true);
  });

  it('should evaluate canary trajectory replay gates and approve valid promotion', () => {
    const replay = CanaryReplayGates.evaluateCanaryReplay(
      {
        runId: 'run-hist-1',
        tenantId: 'tenant-res-a',
        agentId: 'ag-canary',
        agentVersion: 'v1',
        inputPrompt: 'Summarize Q3',
        expectedOutputSubstring: 'revenue increased',
        baselineCostUSD: 0.005,
      },
      'Our revenue increased by 25% in Q3.',
      0.006,
      true
    );

    expect(replay.promotionApproved).toBe(true);
    expect(replay.outputEquivalencePassed).toBe(true);
  });

  it('should manage operational degradation modes on component health failure', () => {
    SystemDegradationManager.reportComponentHealth('database', false);
    SystemDegradationManager.reportComponentHealth('database', false);
    SystemDegradationManager.reportComponentHealth('database', false);

    expect(SystemDegradationManager.getOperationalMode()).toBe('READ_ONLY');
  });

  it('should evaluate 0-100% production readiness score', () => {
    SystemDegradationManager.setOperationalMode('NORMAL');
    const score = EdgeReadinessScorer.evaluateProductionReadiness('tenant-res-a', 'tenant-res-b');
    expect(score.overallScorePercent).toBeGreaterThanOrEqual(90);
    expect(score.productionReady).toBe(true);
  });
});
