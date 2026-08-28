import { describe, it, expect } from 'vitest';
import { EventWorker } from '../index.js';

describe('EventWorker Stream Suite', () => {
  const worker = new EventWorker();

  it('should consume and route CloudEvents to handlers', async () => {
    const res = await worker.processEvent({
      id: 'evt_123',
      type: 'shivi.agent.state_changed',
      source: '/agents/gtm-01',
      data: { previousState: 'STAGING', newState: 'CANARY' },
      time: new Date().toISOString(),
    });
    expect(res.processed).toBe(true);
  });
});
