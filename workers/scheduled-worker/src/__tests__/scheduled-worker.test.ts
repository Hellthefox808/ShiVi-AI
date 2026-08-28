import { describe, it, expect } from 'vitest';
import { ScheduledWorker } from '../index.js';

describe('ScheduledWorker Cron Suite', () => {
  const worker = new ScheduledWorker();

  it('should execute scheduled maintenance and health check jobs', async () => {
    const res = await worker.executeTask('periodic_fleet_health_check');
    expect(res.status).toBe('completed');
  });
});
