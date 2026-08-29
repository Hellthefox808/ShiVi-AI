/**
 * ShiVi Agent Runtime — Multi-Dimensional Drift Detection Engine
 * Tracks Data Drift, Model Drift, Behavior Drift, Retrieval Drift, and Tool Drift against baselines.
 */

export type DriftType =
  | 'DATA_DRIFT'
  | 'CONCEPT_DRIFT'
  | 'MODEL_DRIFT'
  | 'BEHAVIOR_DRIFT'
  | 'RETRIEVAL_DRIFT'
  | 'TOOL_DRIFT';

export type DriftSeverity = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface BehavioralBaseline {
  agentId: string;
  tenantId: string;
  expectedAvgLatencyMs: number;
  expectedMaxToolCallsPerTurn: number;
  expectedCostUSDPerTurn: number;
  expectedGroundednessMin: number;
  expectedFailureRateMax: number;
  establishedAt: number;
}

export interface DriftAnomaly {
  driftId: string;
  tenantId: string;
  agentId: string;
  type: DriftType;
  severity: DriftSeverity;
  baselineValue: number;
  currentValue: number;
  percentageDeviation: number;
  description: string;
  recommendedAction: string;
  detectedAt: number;
}

export class DriftDetectionEngine {
  private static baselines = new Map<string, BehavioralBaseline>();
  private static anomalies: DriftAnomaly[] = [];

  private static getKey(tenantId: string, agentId: string): string {
    return `${tenantId}:${agentId}`;
  }

  /**
   * Set or update behavioral baseline for an agent
   */
  public static setBaseline(baseline: BehavioralBaseline): void {
    this.baselines.set(this.getKey(baseline.tenantId, baseline.agentId), baseline);
  }

  /**
   * Get baseline for an agent
   */
  public static getBaseline(tenantId: string, agentId: string): BehavioralBaseline | undefined {
    return this.baselines.get(this.getKey(tenantId, agentId));
  }

  /**
   * Analyze telemetry metrics against baseline to detect drift anomalies
   */
  public static evaluateDrift(
    tenantId: string,
    agentId: string,
    currentMetrics: {
      avgLatencyMs: number;
      toolCallsPerTurn: number;
      costUSDPerTurn: number;
      groundednessScore: number;
      failureRate: number;
    }
  ): DriftAnomaly[] {
    let baseline = this.getBaseline(tenantId, agentId);
    if (!baseline) {
      // Establish default baseline if none exists
      baseline = {
        agentId,
        tenantId,
        expectedAvgLatencyMs: 400,
        expectedMaxToolCallsPerTurn: 5,
        expectedCostUSDPerTurn: 0.02,
        expectedGroundednessMin: 90.0,
        expectedFailureRateMax: 2.0,
        establishedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      };
      this.setBaseline(baseline);
    }

    const detected: DriftAnomaly[] = [];

    // 1. Behavior Drift: Runaway tool calls (e.g. 480 vs baseline 5)
    if (currentMetrics.toolCallsPerTurn > baseline.expectedMaxToolCallsPerTurn * 2) {
      const dev = Math.round(((currentMetrics.toolCallsPerTurn - baseline.expectedMaxToolCallsPerTurn) / baseline.expectedMaxToolCallsPerTurn) * 100);
      const severity: DriftSeverity = currentMetrics.toolCallsPerTurn > 50 ? 'CRITICAL' : 'HIGH';
      const anomaly: DriftAnomaly = {
        driftId: `drift_bhv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tenantId,
        agentId,
        type: 'BEHAVIOR_DRIFT',
        severity,
        baselineValue: baseline.expectedMaxToolCallsPerTurn,
        currentValue: currentMetrics.toolCallsPerTurn,
        percentageDeviation: dev,
        description: `Runaway execution detected: Agent invoked ${currentMetrics.toolCallsPerTurn} tools (baseline: ${baseline.expectedMaxToolCallsPerTurn}).`,
        recommendedAction: 'Trigger recovery circuit breaker, throttle agent execution, and inspect prompt looping.',
        detectedAt: Date.now(),
      };
      detected.push(anomaly);
      this.anomalies.push(anomaly);
    }

    // 2. Retrieval Drift: Groundedness drop
    if (currentMetrics.groundednessScore < baseline.expectedGroundednessMin) {
      const dev = Math.round(((baseline.expectedGroundednessMin - currentMetrics.groundednessScore) / baseline.expectedGroundednessMin) * 100);
      const severity: DriftSeverity = currentMetrics.groundednessScore < 70 ? 'HIGH' : 'MEDIUM';
      const anomaly: DriftAnomaly = {
        driftId: `drift_ret_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tenantId,
        agentId,
        type: 'RETRIEVAL_DRIFT',
        severity,
        baselineValue: baseline.expectedGroundednessMin,
        currentValue: currentMetrics.groundednessScore,
        percentageDeviation: dev,
        description: `Retrieval quality dropped: Groundedness score ${currentMetrics.groundednessScore}% below threshold ${baseline.expectedGroundednessMin}%.`,
        recommendedAction: 'Trigger evaluation harness, verify index freshness, and fallback to authoritative sources.',
        detectedAt: Date.now(),
      };
      detected.push(anomaly);
      this.anomalies.push(anomaly);
    }

    // 3. Model Drift: Cost or latency spike
    if (currentMetrics.avgLatencyMs > baseline.expectedAvgLatencyMs * 3) {
      const dev = Math.round(((currentMetrics.avgLatencyMs - baseline.expectedAvgLatencyMs) / baseline.expectedAvgLatencyMs) * 100);
      const anomaly: DriftAnomaly = {
        driftId: `drift_mod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        tenantId,
        agentId,
        type: 'MODEL_DRIFT',
        severity: 'MEDIUM',
        baselineValue: baseline.expectedAvgLatencyMs,
        currentValue: currentMetrics.avgLatencyMs,
        percentageDeviation: dev,
        description: `Latency anomaly: Average latency ${currentMetrics.avgLatencyMs}ms exceeds baseline ${baseline.expectedAvgLatencyMs}ms.`,
        recommendedAction: 'Re-route traffic to secondary model provider via Model Router.',
        detectedAt: Date.now(),
      };
      detected.push(anomaly);
      this.anomalies.push(anomaly);
    }

    return detected;
  }

  /**
   * List detected drift anomalies for a tenant
   */
  public static listAnomalies(tenantId: string, minSeverity?: DriftSeverity): DriftAnomaly[] {
    const severityValues: Record<DriftSeverity, number> = {
      NONE: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };

    let items = this.anomalies.filter((a) => a.tenantId === tenantId);
    if (minSeverity) {
      const minVal = severityValues[minSeverity];
      items = items.filter((a) => severityValues[a.severity] >= minVal);
    }
    return items.sort((a, b) => b.detectedAt - a.detectedAt);
  }

  /**
   * Reset store (for testing)
   */
  public static resetStore(): void {
    this.baselines.clear();
    this.anomalies = [];
  }
}

export default DriftDetectionEngine;
