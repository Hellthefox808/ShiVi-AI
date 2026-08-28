import { describe, it, expect } from 'vitest';
import { AgentsService } from '../index.js';

describe('AgentsService Control Plane Suite', () => {
  const service = new AgentsService();

  it('should register a new agent in fleet', async () => {
    const agent = await service.registerAgent({
      name: 'SQL Query Assistant',
      version: '1.0.0',
      tenantId: 'tenant_agents',
      allowedTools: ['tool_sql_read'],
      riskTier: 'T1',
    });
    expect(agent.agentId).toBeDefined();
    expect(agent.state).toBe('ACTIVE');
  });

  it('should dispatch an agent task', async () => {
    const dispatch = await service.dispatchTask({
      agentId: 'agent_sql_1',
      tenantId: 'tenant_agents',
      prompt: 'Get count of active users',
    });
    expect(dispatch.taskId).toBeDefined();
    expect(dispatch.status).toBe('queued');
  });

  it('should record agent heartbeat', async () => {
    const ack = await service.recordHeartbeat('agent_sql_1', { status: 'healthy', cpuPct: 12 });
    expect(ack).toBe(true);
  });
});
