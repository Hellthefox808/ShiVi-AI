import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry, McpGatewayServer } from '../index.js';
import { TenancyContext, CapabilityBroker } from '@shivi/kernel';

describe('ShiVi MCP Gateway & Tool Protocol Suite', () => {
  const sampleTenant: TenancyContext = {
    tenantId: 'tenant-mcp',
    organizationId: 'org-mcp',
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

  beforeEach(() => {
    ToolRegistry.bootstrapLegacyNexTools();
  });

  it('should list all registered MCP tools via tools/list protocol method', async () => {
    const res = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });

    expect(res.result).toBeDefined();
    const resultObj = res.result as { tools: Array<{ name: string }> };
    expect(resultObj.tools.length).toBeGreaterThanOrEqual(5);
    expect(resultObj.tools.some((t) => t.name === 'list_files_code')).toBe(true);
  });

  it('should execute MCP tool call with capability token validation', async () => {
    const token = CapabilityBroker.issueToken('tenant-mcp', 'agent-01', {
      capabilityId: 'cap-list-files',
      resource: 'filesystem',
      operation: 'T0',
      riskLevel: 'T0',
      requiresHumanApproval: false,
      maxDelegationDepth: 2,
    });

    const res = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'list_files_code',
        arguments: { path: '/workspace' },
        capabilityTokenId: token.tokenId,
      },
    });

    expect(res.result).toBeDefined();
    const resultObj = res.result as { content: Array<{ type: string; text: string }> };
    expect(resultObj.content[0].text).toContain('file1.txt');
  });

  it('should reject call to non-existent tool with code -32601', async () => {
    const res = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'non_existent_tool',
      },
    });

    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(-32601);
  });

  it('should execute Serena MCP symbol search tool', async () => {
    const token = CapabilityBroker.issueToken('tenant-mcp', 'agent-01', {
      capabilityId: 'cap-serena-search',
      resource: 'codebase',
      operation: 'T1',
      riskLevel: 'T1',
      requiresHumanApproval: false,
      maxDelegationDepth: 2,
    });

    const res = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'serena_symbol_search',
        arguments: { query: 'TenancyManager' },
        capabilityTokenId: token.tokenId,
      },
    });

    expect(res.result).toBeDefined();
    const resultObj = res.result as { content: Array<{ text: string }> };
    expect(resultObj.content[0].text).toContain('Serena MCP');
  });

  it('should execute Context7 MCP documentation fetcher tool', async () => {
    const token = CapabilityBroker.issueToken('tenant-mcp', 'agent-01', {
      capabilityId: 'cap-context7-docs',
      resource: 'docs',
      operation: 'T0',
      riskLevel: 'T0',
      requiresHumanApproval: false,
      maxDelegationDepth: 2,
    });

    const res = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'context7_fetch_docs',
        arguments: { libraryName: 'fastify', topic: 'sse' },
        capabilityTokenId: token.tokenId,
      },
    });

    expect(res.result).toBeDefined();
    const resultObj = res.result as { content: Array<{ text: string }> };
    expect(resultObj.content[0].text).toContain('Context7 Verified Docs');
  });

  it('should execute PostgreSQL, Redis, BigQuery and Infrastructure MCP tools', async () => {
    const token = CapabilityBroker.issueToken('tenant-mcp', 'agent-01', {
      capabilityId: 'cap-infra-mcp',
      resource: 'infra',
      operation: '*',
      riskLevel: 'T2',
      requiresHumanApproval: false,
      maxDelegationDepth: 2,
    });


    const pgRes = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: { name: 'postgres_execute_query', arguments: { sql: 'SELECT 1' }, capabilityTokenId: token.tokenId },
    });
    expect((pgRes.result as any).content[0].text).toContain('PostgreSQL MCP');

    const redisRes = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: { name: 'redis_get_key', arguments: { key: 'test-key' }, capabilityTokenId: token.tokenId },
    });
    expect((redisRes.result as any).content[0].text).toContain('Redis MCP');

    const bqRes = await McpGatewayServer.handleRequest(sampleTenant, {
      jsonrpc: '2.0',
      id: 8,
      method: 'tools/call',
      params: { name: 'bigquery_run_sql', arguments: { query: 'SELECT count(*) FROM ds.table' }, capabilityTokenId: token.tokenId },
    });
    expect((bqRes.result as any).content[0].text).toContain('BigQuery MCP');
  });
});


