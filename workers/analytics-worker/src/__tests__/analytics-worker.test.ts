import { describe, it, expect } from 'vitest';
import { AnalyticsWorker } from '../index.js';

describe('AnalyticsWorker Rollup Suite', () => {
  const worker = new AnalyticsWorker();

  it('should compute hourly token cost and latency aggregates', async () => {
    const res = await worker.rollupMetrics('tenant_analytics', '1h');
    expect(res.metricsAggregatedCount).toBeGreaterThan(0);
  });
});
