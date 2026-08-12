/**
 * ShiVi X100+ Kernel REST API & Fastify Gateway Application
 * Standard: SAD v2.0 §12, TDA v1.1 §1439, FTL System 61
 */

import Fastify from 'fastify';
import { TenancyManager, TenancyContext, AgentMemoryEngine, WorkflowEngine } from '@shivi/kernel';
import { AgentLifecycleManager, AgentExecutor } from '@shivi/agent-runtime';
import { McpGatewayServer, ToolRegistry, McpJsonRpcRequest } from '@shivi/mcp-gateway';
import { ModelRouter, VectorRetrievalEngine } from '@shivi/ai-sdk';
import { TenancyContextSchema, AgentExecutionTaskSchema, McpJsonRpcRequestSchema } from '@shivi/contracts';

export function buildServer() {
  const server = Fastify({ logger: false });

  // Initialize tool registry
  ToolRegistry.bootstrapLegacyNexTools();

  // Health Check
  server.get('/health', async () => {
    return { status: 'HEALTHY', system: 'ShiVi X100+ Kernel API', timestamp: new Date().toISOString() };
  });

  // Register Tenant Context
  server.post('/api/v1/tenants', async (request, reply) => {
    const parseRes = TenancyContextSchema.safeParse(request.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'INVALID_TENANT_PAYLOAD', details: parseRes.error.issues });
    }
    TenancyManager.registerTenant(parseRes.data as TenancyContext);
    return reply.status(201).send({ status: 'REGISTERED', tenantId: parseRes.data.tenantId });
  });

  // Register Agent
  server.post('/api/v1/agents/register', async (request, reply) => {
    const body = request.body as {
      agentId: string;
      agentVersion: string;
      tenantId: string;
      name: string;
      description: string;
      allowedTools: string[];
      maxRiskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
    };

    const agent = AgentLifecycleManager.registerAgent(
      body.agentId,
      body.agentVersion,
      body.tenantId,
      body.name,
      body.description,
      body.allowedTools || [],
      body.maxRiskLevel || 'T2'
    );

    // Auto-advance to ACTIVE for testing
    AgentLifecycleManager.transitionState(body.tenantId, body.agentId, body.agentVersion, 'EVALUATING');
    AgentLifecycleManager.transitionState(body.tenantId, body.agentId, body.agentVersion, 'SECURITY_REVIEW');
    AgentLifecycleManager.transitionState(body.tenantId, body.agentId, body.agentVersion, 'STAGING');
    const active = AgentLifecycleManager.transitionState(body.tenantId, body.agentId, body.agentVersion, 'CANARY');

    return reply.status(201).send({ status: 'REGISTERED', agent: active });
  });

  // Execute Agent Task
  server.post('/api/v1/agents/execute', async (request, reply) => {
    const parseRes = AgentExecutionTaskSchema.safeParse(request.body);
    if (!parseRes.success) {
      return reply.status(400).send({ error: 'INVALID_TASK_PAYLOAD', details: parseRes.error.issues });
    }

    const tenant = TenancyManager.getTenant(parseRes.data.tenantId);
    if (!tenant) {
      return reply.status(404).send({ error: 'TENANT_NOT_FOUND', tenantId: parseRes.data.tenantId });
    }

    try {
      const result = await AgentExecutor.executeTask(tenant, parseRes.data);
      return reply.send(result);
    } catch (err) {
      return reply.status(400).send({ error: 'EXECUTION_FAILED', message: (err as Error).message });
    }
  });

  // Unified Agent Memory API - Store
  server.post('/api/v1/memory/store', async (request, reply) => {
    const body = request.body as any;
    try {
      const item = AgentMemoryEngine.storeMemory(body);
      return reply.status(201).send({ status: 'STORED', memoryItem: item });
    } catch (err: any) {
      return reply.status(400).send({ error: 'MEMORY_STORE_FAILED', message: err.message });
    }
  });

  // Unified Agent Memory API - Query
  server.get('/api/v1/memory/query', async (request, reply) => {
    const query = request.query as { tenantId: string; agentId: string; tier?: string; key?: string };
    if (!query.tenantId || !query.agentId) {
      return reply.status(400).send({ error: 'MISSING_PARAMS', message: 'tenantId and agentId are required.' });
    }
    const items = AgentMemoryEngine.queryMemory(query.tenantId, query.agentId, query.tier as any, query.key);
    return reply.send({ tenantId: query.tenantId, agentId: query.agentId, count: items.length, items });
  });

  // Durable Event-Driven Workflow API - Trigger
  server.post('/api/v1/workflows/execute', async (request, reply) => {
    const body = request.body as {
      tenantId: string;
      definitionName: string;
      idempotencyKey: string;
      input: Record<string, unknown>;
    };

    if (!body.tenantId || !body.definitionName || !body.idempotencyKey) {
      return reply.status(400).send({ error: 'MISSING_PARAMS', message: 'tenantId, definitionName, and idempotencyKey are required.' });
    }

    // Default 1-step demo workflow
    const steps = [
      {
        stepId: 'step-1',
        name: 'Process Workflow Payload',
        action: async (inp: Record<string, unknown>) => ({ processed: true, timestamp: Date.now(), ...inp }),
      },
    ];

    const instance = await WorkflowEngine.executeWorkflow(body.tenantId, body.definitionName, body.idempotencyKey, steps, body.input || {});
    return reply.status(200).send(instance);
  });

  // AI Gateway Model Router API
  server.post('/api/v1/ai/route', async (request, reply) => {
    const body = request.body as { tenantId: string; agentId: string; taskComplexity: 'SIMPLE' | 'MEDIUM' | 'COMPLEX'; privacyRestricted?: boolean };
    const route = ModelRouter.selectRoute(body);
    return reply.send({ status: 'ROUTED', route });
  });

  // Vector Retrieval ACL Search API
  server.post('/api/v1/rag/query', async (request, reply) => {
    const body = request.body as { tenantId: string; userRoles: string[]; queryVector: number[]; topK?: number };
    let tenant = TenancyManager.getTenant(body.tenantId);
    if (!tenant) {
      tenant = {
        tenantId: body.tenantId,
        organizationId: 'org-default',
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
      };
      TenancyManager.registerTenant(tenant);
    }

    const results = VectorRetrievalEngine.queryVectorIndex(tenant, body.userRoles || [], body.queryVector || [], body.topK || 5);
    return reply.send({ tenantId: body.tenantId, count: results.length, results });
  });

  // MCP JSON-RPC 2.0 Router
  server.post('/api/v1/mcp/rpc', async (request, reply) => {
    const tenantId = (request.headers['x-shivi-tenant-id'] as string) || 'tenant-default';
    let tenant = TenancyManager.getTenant(tenantId);
    if (!tenant) {
      tenant = {
        tenantId,
        organizationId: 'org-default',
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
      };
      TenancyManager.registerTenant(tenant);
    }

    const parseRes = McpJsonRpcRequestSchema.safeParse(request.body);
    if (!parseRes.success) {
      return reply.status(400).send({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'Invalid Request' } });
    }

    const mcpRes = await McpGatewayServer.handleRequest(tenant, parseRes.data as McpJsonRpcRequest);
    return reply.send(mcpRes);
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  const server = buildServer();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  server.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`[ShiVi Kernel REST API] Server listening on ${address}`);
  });
}
