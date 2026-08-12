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
});
