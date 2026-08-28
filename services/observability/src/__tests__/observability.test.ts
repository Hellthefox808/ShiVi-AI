import { describe, it, expect } from 'vitest';
import { ObservabilityService } from '../index.js';

describe('ObservabilityService Platform Suite', () => {
  const service = new ObservabilityService();

  it('should record distributed trace spans', async () => {
    const span = await service.recordSpan({
      traceId: 'tr_123',
      spanId: 'sp_456',
      name: 'ExecuteAgentTask',
      serviceName: 'kernel-api',
      durationMs: 45,
    });
    expect(span.spanId).toBe('sp_456');
  });

  it('should retrieve overall platform service health report', async () => {
    const health = await service.getSystemHealth();
    expect(health.status).toBe('healthy');
    expect(health.services.length).toBeGreaterThan(0);
  });
});
