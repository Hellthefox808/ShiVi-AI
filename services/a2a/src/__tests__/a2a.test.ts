import { describe, it, expect } from 'vitest';
import { A2AService } from '../index.js';

describe('A2AService (Agent-to-Agent Collaboration) Suite', () => {
  const service = new A2AService();

  it('should establish an A2A collaboration channel', async () => {
    const channel = await service.createChannel({
      tenantId: 'tenant_a2a',
      participantAgentIds: ['agent_planner', 'agent_coder'],
      channelType: 'peer_to_peer',
    });
    expect(channel.channelId).toBeDefined();
    expect(channel.participantAgentIds.length).toBe(2);
  });

  it('should send and broadcast messages between agents', async () => {
    const message = await service.sendMessage({
      channelId: 'chan_123',
      senderAgentId: 'agent_planner',
      recipientAgentId: 'agent_coder',
      content: { action: 'review_code', file: 'server.ts' },
    });
    expect(message.messageId).toBeDefined();
    expect(message.timestamp).toBeInstanceOf(Date);
  });
});
