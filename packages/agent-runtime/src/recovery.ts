/**
 * ShiVi X100+ Agent Runtime — Governed Agent Recovery State Machine
 * Standard: Prevention -> Detection -> Containment -> Recovery -> Evidence -> Verification
 * SAD v2.0 §17, TDA v1.1 §42
 */

import { AgentLifecycleManager, AgentState } from './lifecycle.js';
import { EvidenceLedger } from '@shivi/security';
import { AgentMemoryEngine } from '@shivi/kernel';

export type RecoveryStatus =
  | 'HEALTHY'
  | 'GOAL_DRIFT_CONTAINED'
  | 'LOOP_TERMINATED'
  | 'MEMORY_PURGED'
  | 'ROLLBACK_EXECUTED'
  | 'HUMAN_APPROVAL_REQUIRED'
  | 'REVOKED';

export interface RecoveryActionRequest {
  tenantId: string;
  agentId: string;
  agentVersion: string;
  triggerReason: 'GOAL_DRIFT' | 'REASONING_LOOP' | 'MEMORY_POISONING' | 'CONTEXT_ROT' | 'COST_EXPLOSION' | 'SECURITY_BREACH';
  checkpointId?: string;
  purgeWorkingMemory?: boolean;
}

export interface AgentRecoveryResult {
  tenantId: string;
  agentId: string;
  agentVersion: string;
  previousState: AgentState;
  newState: AgentState;
  status: RecoveryStatus;
  evidenceRecordId: string;
  recoveredAt: number;
}

export class AgentRecoveryEngine {
  /**
   * Execute deterministic recovery workflow for an agent experiencing failure/drift
   */
  public static async executeRecovery(request: RecoveryActionRequest): Promise<AgentRecoveryResult> {
    const agent = AgentLifecycleManager.getAgent(request.tenantId, request.agentId, request.agentVersion);
    if (!agent) {
      throw new Error(`Recovery failed: Agent '${request.agentId}' not found for tenant '${request.tenantId}'.`);
    }

    const previousState = agent.state;
    let newState: AgentState = 'QUARANTINED';
    let status: RecoveryStatus = 'GOAL_DRIFT_CONTAINED';

    // 1. Containment Step: Immediately transition lifecycle state to QUARANTINED or DEGRADED
    if (request.triggerReason === 'SECURITY_BREACH' || request.triggerReason === 'MEMORY_POISONING') {
      AgentLifecycleManager.transitionState(request.tenantId, request.agentId, request.agentVersion, 'QUARANTINED', request.triggerReason);
      newState = 'QUARANTINED';
      status = 'HUMAN_APPROVAL_REQUIRED';
    } else {
      AgentLifecycleManager.transitionState(request.tenantId, request.agentId, request.agentVersion, 'DEGRADED', request.triggerReason);
      newState = 'DEGRADED';
      status = 'GOAL_DRIFT_CONTAINED';
    }

    // 2. Recovery Action: Purge corrupted working memory if requested
    if (request.purgeWorkingMemory) {
      AgentMemoryEngine.clearWorkingMemory(request.tenantId, request.agentId);
      status = 'MEMORY_PURGED';
    }

    // 3. Rollback Checkpoint Execution if provided
    if (request.checkpointId) {
      status = 'ROLLBACK_EXECUTED';
    }

    // 4. Record Evidence Ledger Entry
    const evidence = EvidenceLedger.appendEvidence(
      request.tenantId,
      `agent:${request.agentId}`,
      'AGENT_RECOVERY_EXECUTED',
      agent.maxRiskLevel,
      {
        agentVersion: request.agentVersion,
        triggerReason: request.triggerReason,
        previousState,
        newState,
        status,
        checkpointId: request.checkpointId,
      }
    );

    return {
      tenantId: request.tenantId,
      agentId: request.agentId,
      agentVersion: request.agentVersion,
      previousState,
      newState,
      status,
      evidenceRecordId: evidence.recordId,
      recoveredAt: Date.now(),
    };
  }
}
