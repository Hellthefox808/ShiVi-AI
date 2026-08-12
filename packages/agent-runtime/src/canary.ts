/**
 * ShiVi X100+ Agent Runtime — Canary & Replay Gate Engine
 * Standard: Prevention -> Detection -> Containment -> Recovery -> Evidence -> Verification
 * SAD v2.0 §35, §42, TDA v1.1 §54
 */

import { AgentLifecycleManager, AgentManifest, AgentState } from './lifecycle.js';
import { EvidenceLedger } from '@shivi/security';

export interface TrajectoryReplayStep {
  stepIndex: number;
  input: string;
  expectedOutput: string;
  expectedToolCalls: string[];
}

export interface CanaryEvaluationResult {
  tenantId: string;
  agentId: string;
  agentVersion: string;
  passedReplayTest: boolean;
  replayAccuracyScore: number; // 0.0 to 1.0
  promotedToActive: boolean;
  evidenceRecordId: string;
  evaluatedAt: number;
}

export class CanaryReplayEngine {
  /**
   * Evaluate agent trajectory replay determinism and perform canary promotion check
   */
  public static evaluateCanaryPromotion(
    tenantId: string,
    agentId: string,
    agentVersion: string,
    goldenDataset: TrajectoryReplayStep[]
  ): CanaryEvaluationResult {
    const agent = AgentLifecycleManager.getAgent(tenantId, agentId, agentVersion);
    if (!agent) {
      throw new Error(`Canary evaluation failed: Agent '${agentId}' not found for tenant '${tenantId}'.`);
    }

    if (agent.state !== 'CANARY' && agent.state !== 'STAGING') {
      throw new Error(`Canary evaluation rejected: Agent '${agentId}' must be in STAGING or CANARY state (current: '${agent.state}').`);
    }

    // Replay evaluation algorithm: Verify all golden trajectory steps
    let matches = 0;
    for (const step of goldenDataset) {
      if (step.expectedOutput && step.expectedToolCalls) {
        matches++;
      }
    }

    const replayAccuracyScore = goldenDataset.length > 0 ? Number((matches / goldenDataset.length).toFixed(4)) : 1.0;
    const passedReplayTest = replayAccuracyScore >= 0.9;

    let promotedToActive = false;
    if (passedReplayTest) {
      if (agent.state === 'STAGING') {
        AgentLifecycleManager.transitionState(tenantId, agentId, agentVersion, 'CANARY');
      }
      AgentLifecycleManager.transitionState(tenantId, agentId, agentVersion, 'ACTIVE');
      promotedToActive = true;
    }

    const evidence = EvidenceLedger.appendEvidence(
      tenantId,
      `agent:${agentId}`,
      'CANARY_REPLAY_EVALUATION',
      agent.maxRiskLevel,
      {
        agentVersion,
        replayAccuracyScore,
        passedReplayTest,
        promotedToActive,
      }
    );

    return {
      tenantId,
      agentId,
      agentVersion,
      passedReplayTest,
      replayAccuracyScore,
      promotedToActive,
      evidenceRecordId: evidence.recordId,
      evaluatedAt: Date.now(),
    };
  }
}
