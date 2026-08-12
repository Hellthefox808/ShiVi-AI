import { describe, it, expect } from 'vitest';
import { TenancyContextSchema, AgentExecutionTaskSchema, McpJsonRpcRequestSchema } from '../index.js';

describe('ShiVi Contracts & Zod Runtime Schema Validation Suite', () => {
  it('should validate valid TenancyContext', () => {
    const valid = {
      tenantId: 'tenant-test',
      organizationId: 'org-test',
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

    const res = TenancyContextSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('should reject invalid TenancyContext with missing organizationId', () => {
    const invalid = {
      tenantId: 'tenant-test',
      environment: 'staging',
    };

    const res = TenancyContextSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('should validate valid AgentExecutionTask', () => {
    const task = {
      taskId: 't-1',
      tenantId: 't-tenant',
      agentId: 'a-1',
      agentVersion: 'v1.0.0',
      inputPrompt: 'Run pipeline diagnostic',
      capabilityTokenId: 'cap-101',
    };

    const res = AgentExecutionTaskSchema.safeParse(task);
    expect(res.success).toBe(true);
  });

  it('should validate valid MCP JSON-RPC Request', () => {
    const mcpReq = {
      jsonrpc: '2.0',
      id: 42,
      method: 'tools/call',
      params: {
        name: 'list_files_code',
        arguments: { path: '/' },
      },
    };

    const res = McpJsonRpcRequestSchema.safeParse(mcpReq);
    expect(res.success).toBe(true);
  });
});
