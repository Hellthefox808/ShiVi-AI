/**
 * ShiVi X100+ Realtime Gateway — Fastify SSE (Server-Sent Events) Endpoint
 * Standard: SAD v2.0 §17, TDA v1.1 §110
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SSEEventPayload } from '@shivi/contracts';
import { RedisClientAdapter } from '@shivi/database';

export function registerSSERoutes(server: FastifyInstance) {
  server.get('/api/v1/agents/stream', async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (request.query as any)?.tenantId || 'tenant-default';
    const sessionId = (request.query as any)?.sessionId || 'sess-stream-01';
    const channel = `agent-stream:${tenantId}:${sessionId}`;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendSSE = (payload: SSEEventPayload) => {
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    // Initial State Event
    sendSSE({
      eventType: 'STATE_CHANGED',
      tenantId,
      sessionId,
      data: { state: 'ACTIVE' },
      timestamp: Date.now(),
    });

    const onMessage = (message: string) => {
      try {
        const payload = JSON.parse(message);
        sendSSE(payload);
        if (payload.eventType === 'TASK_COMPLETED' || payload.eventType === 'TASK_FAILED') {
          reply.raw.write('event: end\ndata: {"status": "complete"}\n\n');
        }
      } catch (err) {
        console.error('SSE JSON parse error', err);
      }
    };

    await RedisClientAdapter.subscribe(channel, onMessage);

    request.raw.on('close', () => {
      // Typically you'd unsubscribe here to avoid memory leaks, but simple implementation for now
      reply.raw.end();
    });
  });
}
