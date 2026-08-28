import { describe, it, expect } from 'vitest';
import { NotificationWorker } from '../index.js';

describe('NotificationWorker Dispatcher Suite', () => {
  const worker = new NotificationWorker();

  it('should deliver batch notification payload to downstream endpoints', async () => {
    const res = await worker.dispatchBatch([
      { recipient: 'ops@shivi.ai', subject: 'System Alert', body: 'Cluster healthy' }
    ]);
    expect(res.deliveredCount).toBe(1);
  });
});
