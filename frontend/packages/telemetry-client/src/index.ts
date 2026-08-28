export interface TelemetryEvent { name: string; properties: Record<string, unknown>; timestamp: string; }
export interface PerformanceMetric { name: string; value: number; unit: 'ms' | 'bytes' | 'count'; }

export class FrontendTelemetryClient {
  private events: TelemetryEvent[] = [];

  constructor(private endpoint: string = '/api/v1/telemetry') {}

  trackEvent(event: TelemetryEvent): void {
    this.events.push(event);
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    this.events.push({
      name: 'error',
      properties: { message: error.message, stack: error.stack, ...context },
      timestamp: new Date().toISOString(),
    });
  }

  trackPerformance(metric: PerformanceMetric): void {
    this.events.push({
      name: 'performance',
      properties: { ...metric },
      timestamp: new Date().toISOString(),
    });
  }

  getEvents(): TelemetryEvent[] {
    return this.events;
  }
}
