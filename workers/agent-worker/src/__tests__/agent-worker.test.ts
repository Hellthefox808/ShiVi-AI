import { describe, it, expect } from 'vitest';
import { AgentWorker } from '../index.js';

describe('AgentWorker Runtime Suite', () => {
  const worker = new AgentWorker();

  it('should process agent execution job successfully', async () => {
    const res = await worker.processJob({
      jobId: 'job_101',
      agentId: 'agent_revops_01',
      prompt: 'Calculate Q3 net revenue retention',
      context: { tenantId: 'tenant_worker' },
      createdAt: new Date(),
    });
    expect(res.success).toBe(true);
    expect((res.result as any).executedJobId).toBe('job_101');
  });

  it('should start and shutdown gracefully', async () => {
    await expect(worker.start()).resolves.not.toThrow();
    await expect(worker.shutdown()).resolves.not.toThrow();
  });
});
