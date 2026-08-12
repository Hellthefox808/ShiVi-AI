/**
 * ShiVi X100+ Resilience — Canary Replay Gates & Trajectory Replay Engine
 * Standard: SAD v2.0 §35, TDA v1.1 §93, FTL System 93
 */

export interface HistoricalTrajectoryRun {
  runId: string;
  tenantId: string;
  agentId: string;
  agentVersion: string;
  inputPrompt: string;
  expectedOutputSubstring: string;
  baselineCostUSD: number;
}

export interface ReplayGateEvaluationResult {
  runId: string;
  policyCompliant: boolean;
  outputEquivalencePassed: boolean;
  costDeltaUSD: number;
  promotionApproved: boolean;
  reason: string;
}

export class CanaryReplayGates {
  /**
   * Replay historical agent trajectory against new candidate version
   */
  public static evaluateCanaryReplay(
    historicalRun: HistoricalTrajectoryRun,
    candidateOutput: string,
    candidateCostUSD: number,
    policyPassed: boolean
  ): ReplayGateEvaluationResult {
    const outputEquivalencePassed = candidateOutput.toLowerCase().includes(historicalRun.expectedOutputSubstring.toLowerCase());
    const costDeltaUSD = Number((candidateCostUSD - historicalRun.baselineCostUSD).toFixed(6));

    // Promotion approved only if policy passes, output equivalence passes, and cost spike < 50%
    const costSpikeAcceptable = candidateCostUSD <= historicalRun.baselineCostUSD * 1.5;
    const promotionApproved = policyPassed && outputEquivalencePassed && costSpikeAcceptable;

    let reason = 'Canary replay gates passed. Ready for release promotion.';
    if (!policyPassed) reason = 'Canary replay failed: Policy violation detected in candidate execution.';
    else if (!outputEquivalencePassed) reason = `Canary replay failed: Output missing expected substring '${historicalRun.expectedOutputSubstring}'`;
    else if (!costSpikeAcceptable) reason = `Canary replay failed: Cost spike (+${costDeltaUSD} USD) exceeded threshold.`;

    return {
      runId: historicalRun.runId,
      policyCompliant: policyPassed,
      outputEquivalencePassed,
      costDeltaUSD,
      promotionApproved,
      reason,
    };
  }
}
