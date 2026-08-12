/**
 * ShiVi X100+ Resilience — Agent Recovery State Machine & Loop/Drift Detector
 * Standard: SAD v2.0 §17, TDA v1.1 §43, FTL System 41
 */

import { AgentLifecycleManager } from '@shivi/agent-runtime';
import { EvidenceLedger } from '@shivi/security';

export type AgentRecoveryStatus =
  | 'NORMAL'
  | 'DRIFT_DETECTED'
  | 'LOOP_DETECTED'
  | 'CONTAINED'
  | 'REPLANNED'
  | 'RECOVERED'
  | 'QUARANTINED'
  | 'EMERGENCY_ABORTED';

export interface TrajectoryStepAudit {
  stepIndex: number;
  thoughtHash: string;
  thoughtText: string;
  toolName?: string;
}

export interface AgentRecoveryState {
  agentId: string;
  tenantId: string;
  recoveryStatus: AgentRecoveryStatus;
  detectedLoopCount: number;
  driftScore: number;
  updatedAt: number;
  reason?: string;
}

export class AgentRecoveryStateMachine {
  private static activeStateMap = new Map<string, AgentRecoveryState>();

  /**
   * Initialize recovery tracking for an active agent run
   */
  public static initTracking(tenantId: string, agentId: string): AgentRecoveryState {
    const key = `${tenantId}:${agentId}`;
    const state: AgentRecoveryState = {
      agentId,
      tenantId,
      recoveryStatus: 'NORMAL',
      detectedLoopCount: 0,
      driftScore: 0.0,
      updatedAt: Date.now(),
    };
    this.activeStateMap.set(key, state);
    return state;
  }

  /**
   * Audit trajectory steps for reasoning loops or trajectory drift
   */
  public static auditTrajectory(
    tenantId: string,
    agentId: string,
    agentVersion: string,
    trajectory: TrajectoryStepAudit[]
  ): AgentRecoveryState {
    const key = `${tenantId}:${agentId}`;
    let recovery = this.activeStateMap.get(key);
    if (!recovery) {
      recovery = this.initTracking(tenantId, agentId);
    }

    // 1. Reasoning Loop Detection: Check for identical thought text/hash repeating > 2 times
    const thoughtCounts = new Map<string, number>();
    for (const step of trajectory) {
      const count = (thoughtCounts.get(step.thoughtHash) || 0) + 1;
      thoughtCounts.set(step.thoughtHash, count);

      if (count >= 3) {
        recovery.recoveryStatus = 'LOOP_DETECTED';
        recovery.detectedLoopCount = count;
        recovery.reason = `Reasoning loop detected: Thought hash '${step.thoughtHash}' repeated ${count} times.`;

        // Action: Contain & Quarantine agent in AgentRuntime state machine
        AgentLifecycleManager.transitionState(tenantId, agentId, agentVersion, 'QUARANTINED', recovery.reason);

        // Record cryptographic evidence entry
        EvidenceLedger.appendEvidence(
          tenantId,
          `agent:${agentId}`,
          'AGENT_RECOVERY_CONTAINMENT',
          'T3',
          { recoveryStatus: recovery.recoveryStatus, loopCount: count, thoughtHash: step.thoughtHash }
        );

        recovery.updatedAt = Date.now();
        return recovery;
      }
    }

    // 2. Trajectory Drift Audit (heuristic score based on total trajectory depth vs threshold)
    if (trajectory.length > 8) {
      recovery.recoveryStatus = 'DRIFT_DETECTED';
      recovery.driftScore = Number((trajectory.length / 10).toFixed(2));
      recovery.reason = `Goal drift warning: Trajectory length (${trajectory.length}) approaching max budget.`;
      recovery.updatedAt = Date.now();
      return recovery;
    }

    recovery.recoveryStatus = 'NORMAL';
    recovery.updatedAt = Date.now();
    return recovery;
  }

  /**
   * Force Emergency Abort override by operator
   */
  public static emergencyAbort(tenantId: string, agentId: string, agentVersion: string, operatorReason: string): AgentRecoveryState {
    const key = `${tenantId}:${agentId}`;
    const recovery = this.initTracking(tenantId, agentId);

    recovery.recoveryStatus = 'EMERGENCY_ABORTED';
    recovery.reason = `Emergency abort by operator: ${operatorReason}`;

    AgentLifecycleManager.transitionState(tenantId, agentId, agentVersion, 'QUARANTINED', recovery.reason);

    EvidenceLedger.appendEvidence(
      tenantId,
      `agent:${agentId}`,
      'EMERGENCY_ABORT',
      'T5',
      { reason: operatorReason }
    );

    recovery.updatedAt = Date.now();
    return recovery;
  }
}
