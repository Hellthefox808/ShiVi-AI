import { describe, it, expect } from 'vitest';
import { AgentSessionContractSchema, SSEEventPayloadSchema } from '../index.js';

describe('ShiVi Contracts Package Suite', () => {
  it('should validate AgentSessionContractSchema', () => {
    const validSession = {
      sessionId: 'sess-001',
      tenantId: 'tenant-alpha',
      agentId: 'agent-01',
      agentVersion: 'v1.0.0',
      state: 'ACTIVE',
      riskLevel: 'T2',
      trajectory: [],
      startedAt: Date.now(),
    };

    const res = AgentSessionContractSchema.safeParse(validSession);
    expect(res.success).toBe(true);
  });

  it('should validate SSEEventPayloadSchema', () => {
    const validSSE = {
      eventType: 'AGENT_STEP',
      tenantId: 'tenant-alpha',
      sessionId: 'sess-001',
      data: { stepIndex: 1 },
      timestamp: Date.now(),
    };

    const res = SSEEventPayloadSchema.safeParse(validSSE);
    expect(res.success).toBe(true);
  });
});
