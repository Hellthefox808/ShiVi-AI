import { describe, it, expect, beforeAll } from 'vitest';
import { buildServer } from '../server.js';
import { FastifyInstance } from 'fastify';

describe('ShiVi Kernel REST API Server Integration Suite', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildServer();
    await app.ready();
  });

  it('should return 200 HEALTHY on GET /health', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.status).toBe('HEALTHY');
  });

  it('should register tenant context via POST /api/v1/tenants', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/tenants',
      payload: {
        tenantId: 'tenant-api-test',
        organizationId: 'org-api-test',
        environment: 'staging',
        homeRegion: 'us-east-1',
        policy: {
          allowedRegions: ['us-east-1'],
          maxRetentionDays: 30,
          dataClassificationLimit: 'CONFIDENTIAL',
          customEncryptionKeyRequired: false,
          vectorIsolationEnabled: true,
          agentMemoryIsolationEnabled: true,
        },
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().status).toBe('REGISTERED');
  });

  it('should register agent via POST /api/v1/agents/register', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/agents/register',
      payload: {
        agentId: 'agent-api-01',
        agentVersion: 'v1.0.0',
        tenantId: 'tenant-api-test',
        name: 'API Agent',
        description: 'Test agent via API',
        allowedTools: ['list_files_code'],
        maxRiskLevel: 'T1',
      },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json().agent.state).toBe('CANARY');
  });

  it('should handle MCP JSON-RPC tools/list request via POST /api/v1/mcp/rpc', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/mcp/rpc',
      headers: {
        'x-shivi-tenant-id': 'tenant-api-test',
      },
      payload: {
        jsonrpc: '2.0',
        id: 99,
        method: 'tools/list',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().result.tools.length).toBeGreaterThan(0);
  });

  it('should store and query agent memory via REST endpoints', async () => {
    const storeRes = await app.inject({
      method: 'POST',
      url: '/api/v1/memory/store',
      payload: {
        id: 'mem-api-01',
        tenantId: 'tenant-api-test',
        agentId: 'agent-api-01',
        tier: 'WORKING',
        key: 'session_key',
        content: { val: 'abc' },
        confidence: 0.9,
        provenance: { sourceId: 'req-1', sourceType: 'USER_INPUT', timestamp: Date.now(), hash: 'xyz' },
        classification: 'INTERNAL',
      },
    });
    expect(storeRes.statusCode).toBe(201);
    expect(storeRes.json().status).toBe('STORED');

    const queryRes = await app.inject({
      method: 'GET',
      url: '/api/v1/memory/query?tenantId=tenant-api-test&agentId=agent-api-01&tier=WORKING',
    });
    expect(queryRes.statusCode).toBe(200);
    expect(queryRes.json().count).toBe(1);
  });

  it('should execute workflow via POST /api/v1/workflows/execute', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/workflows/execute',
      payload: {
        tenantId: 'tenant-api-test',
        definitionName: 'onboarding-flow',
        idempotencyKey: 'api-idem-100',
        input: { userId: 'u-123' },
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('COMPLETED');
  });

  it('should select AI route via POST /api/v1/ai/route', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/ai/route',
      payload: {
        tenantId: 'tenant-api-test',
        agentId: 'agent-api-01',
        taskComplexity: 'COMPLEX',
      },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().route.primaryModel).toBe('gemini-1.5-pro');
  });
});

