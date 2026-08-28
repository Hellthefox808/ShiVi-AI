import { describe, it, expect } from 'vitest';
import {
  TenancyContextSchema,
  AgentExecutionTaskSchema,
  McpJsonRpcRequestSchema,
  AccountSchema,
  OpportunitySchema,
  DealRiskSchema,
  ApprovalRequestSchema,
} from '../index.js';

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

  it('should validate valid Account & Opportunity CRM contracts', () => {
    const account = {
      id: 'acc-acme-1',
      tenantId: 'tenant-prod-1',
      name: 'Acme Enterprise Corp',
      domain: 'acme.com',
      industry: 'Software',
      employees: 5000,
      annualRevenue: 50000000,
      tier: 'STRATEGIC',
      healthScore: 88,
      status: 'ACTIVE',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };
    const accRes = AccountSchema.safeParse(account);
    expect(accRes.success).toBe(true);

    const opportunity = {
      id: 'opp-100k-1',
      tenantId: 'tenant-prod-1',
      accountId: 'acc-acme-1',
      name: 'Acme Platform Expansion',
      amount: 100000,
      currency: 'USD',
      stage: 'PROPOSAL_PRICE_QUOTE',
      probability: 70,
      closeDate: '2026-09-30',
      forecastCategory: 'COMMIT',
      riskScore: 35,
      assignedRepId: 'rep-alex-01',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    };
    const oppRes = OpportunitySchema.safeParse(opportunity);
    expect(oppRes.success).toBe(true);
  });

  it('should validate RevOps DealRisk and ApprovalRequest contracts', () => {
    const dealRisk = {
      id: 'risk-01',
      tenantId: 'tenant-prod-1',
      opportunityId: 'opp-100k-1',
      riskScore: 72,
      riskFactors: [
        {
          code: 'STALLED_STAGE',
          description: 'Deal stalled in Proposal stage for > 30 days',
          severity: 'HIGH',
          impactScore: 60,
          suggestedAction: 'Engage Economic Buyer via Executive Sponsor outreach',
        },
      ],
      stalledDays: 34,
      missingStakeholders: ['ECONOMIC_BUYER'],
      nextBestAction: 'Schedule Executive Alignment Session',
      detectedAt: Date.now(),
      status: 'ACTIVE_RISK',
    };
    const riskRes = DealRiskSchema.safeParse(dealRisk);
    expect(riskRes.success).toBe(true);

    const approval = {
      id: 'appr-01',
      tenantId: 'tenant-prod-1',
      agentId: 'deal-strategy-agent',
      taskId: 'task-recover-100k',
      actionType: 'CRM_STAGE_MUTATION',
      riskLevel: 'T3',
      summary: 'Update stage to Negotiation and create Executive Outreach task',
      proposedPayload: { newStage: 'NEGOTIATION_REVIEW', targetTaskId: 'task-exec-call' },
      status: 'PENDING',
      requestedAt: Date.now(),
    };
    const apprRes = ApprovalRequestSchema.safeParse(approval);
    expect(apprRes.success).toBe(true);
  });
});

