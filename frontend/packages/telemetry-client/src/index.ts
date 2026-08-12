export interface TelemetryEvent { name: string; properties: Record<string, unknown>; timestamp: string; }
export interface PerformanceMetric { name: string; value: number; unit: 'ms' | 'bytes' | 'count'; }
export class FrontendTelemetry { constructor(private endpoint: string) {}
  trackEvent(event: TelemetryEvent): void {}
  trackError(error: Error, context?: Record<string, unknown>): void {}
  trackPerformance(metric: PerformanceMetric): void {}
}
