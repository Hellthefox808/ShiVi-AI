import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '../index.js';

describe('AnalyticsService Platform Suite', () => {
  const service = new AnalyticsService();

  it('should track user and agent event streams', async () => {
    const ack = await service.trackEvent({
      tenantId: 'tenant_analytics',
      eventType: 'agent_executed',
      properties: { agentId: 'agent_01', durationMs: 250 },
    });
    expect(ack.eventId).toBeDefined();
  });

  it('should aggregate time-series metric rollups', async () => {
    const report = await service.getMetricRollup('tenant_analytics', 'agent_executions', '1h');
    expect(report.points.length).toBeGreaterThan(0);
    expect(report.total).toBeGreaterThan(0);
  });
});
