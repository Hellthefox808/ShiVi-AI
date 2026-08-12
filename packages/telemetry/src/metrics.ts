/**
 * ShiVi X100+ Telemetry — Metrics Collector
 * Standard: SAD v2.0 §33, TDA v1.1 §91
 */

export interface MetricEntry {
  name: string;
  value: number;
  tenantId: string;
  labels: Record<string, string>;
  timestamp: number;
}

export class MetricsCollector {
  private static metricsBuffer: MetricEntry[] = [];

  /**
   * Record counter metric
   */
  public static incrementCounter(
    name: string,
    tenantId: string,
    value: number = 1,
    labels: Record<string, string> = {}
  ): void {
    this.metricsBuffer.push({
      name,
      value,
      tenantId,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Record histogram/duration metric in milliseconds
   */
  public static recordDuration(
    name: string,
    tenantId: string,
    durationMs: number,
    labels: Record<string, string> = {}
  ): void {
    this.metricsBuffer.push({
      name,
      value: durationMs,
      tenantId,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Retrieve buffered metrics for telemetry export
   */
  public static getMetrics(): MetricEntry[] {
    return [...this.metricsBuffer];
  }

  /**
   * Clear buffer after export
   */
  public static clear(): void {
    this.metricsBuffer = [];
  }
}
