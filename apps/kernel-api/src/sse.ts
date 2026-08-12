/**
 * ShiVi X100+ Realtime Gateway — Fastify SSE (Server-Sent Events) Endpoint
 * Standard: SAD v2.0 §17, TDA v1.1 §110
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { SSEEventPayload } from '@shivi/contracts';

export function registerSSERoutes(server: FastifyInstance) {
  server.get('/api/v1/agents/stream', async (request: FastifyRequest, reply: FastifyReply) => {
    const tenantId = (request.query as any)?.tenantId || 'tenant-default';
    const sessionId = (request.query as any)?.sessionId || 'sess-stream-01';

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    });

    const sendSSE = (payload: SSEEventPayload) => {
      reply.raw.write(`data: ${JSON.stringify(payload)}\n\n`);
    };

    // 1. Initial State Event
    sendSSE({
      eventType: 'STATE_CHANGED',
      tenantId,
      sessionId,
      data: { state: 'ACTIVE' },
      timestamp: Date.now(),
    });

    // 2. Simulated Agent Step Event
    sendSSE({
      eventType: 'AGENT_STEP',
      tenantId,
      sessionId,
      data: {
        stepIndex: 1,
        thoughtStatus: 'Analyzing request and preparing tool execution context',
        confidenceScore: 0.96,
      },
      timestamp: Date.now(),
    });

    // 3. Tool Execution Event
    sendSSE({
      eventType: 'TOOL_COMPLETED',
      tenantId,
      sessionId,
      data: {
        toolName: 'vector-search',
        executionTimeMs: 42,
        status: 'COMPLETED',
      },
      timestamp: Date.now(),
    });

    // End stream safely
    reply.raw.write('event: end\ndata: {"status": "complete"}\n\n');
  });
}
