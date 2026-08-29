/**
 * ShiVi Policy Engine & Data Foundation Tests
 * Verifies executable policy-as-code evaluation, risk tier calculation,
 * and data governance primitives (source tracking, lineage, quality, freshness, schema drift).
 */
import { describe, it, expect } from 'vitest';
import { PolicyEngine } from '@shivi/service-policy';

describe('Policy Engine', () => {
  const tenantId = 'tenant_policy_test';
  let engine: PolicyEngine;

  beforeEach(() => {
    engine = new PolicyEngine();
  });

  // ─── Policy Lifecycle ───────────────────────────────────────────────────

  describe('Policy Lifecycle', () => {
    it('should register a new policy in DRAFT status', () => {
      const policy = engine.registerPolicy(tenantId, {
        name: 'Custom Data Access Policy',
        description: 'Controls access to customer data',
        rules: [
          {
            id: 'rule_1',
            name: 'Block external model on restricted data',
            description: 'Prevents restricted data from reaching external LLMs',
            conditions: [
              { field: 'resourceClassification', operator: 'eq', value: 'RESTRICTED' },
              { field: 'modelProvider', operator: 'neq', value: 'shivi-internal' },
            ],
            effect: 'DENY',
            priority: 100,
            requiresAudit: true,
          },
        ],
        version: 1,
        status: 'DRAFT',
        environment: 'production',
      });

      expect(policy.id).toBeTruthy();
      expect(policy.status).toBe('DRAFT');
      expect(policy.tenantId).toBe(tenantId);
      expect(policy.createdAt).toBeGreaterThan(0);
    });

    it('should activate an approved policy', () => {
      const policy = engine.registerPolicy(tenantId, {
        name: 'Activation Test',
        description: 'Test activation',
        rules: [],
        version: 1,
        status: 'APPROVED',
        environment: 'production',
      });

      const activated = engine.activatePolicy(tenantId, policy.id);
      expect(activated.status).toBe('ACTIVE');
    });

    it('should retire a policy', () => {
      const policy = engine.registerPolicy(tenantId, {
        name: 'Retirement Test',
        description: 'Test retirement',
        rules: [],
        version: 1,
        status: 'ACTIVE',
        environment: 'production',
      });

      const retired = engine.retirePolicy(tenantId, policy.id);
      expect(retired.status).toBe('RETIRED');
    });

    it('should list policies for a tenant', () => {
      engine.registerPolicy(tenantId, {
        name: 'List Test Policy',
        description: 'Test listing',
        rules: [],
        version: 1,
        status: 'ACTIVE',
        environment: 'production',
      });
      const policies = engine.listPolicies(tenantId);
      expect(policies.length).toBeGreaterThanOrEqual(1);
      expect(policies.every((p) => p.tenantId === tenantId)).toBe(true);
    });
  });

  // ─── Policy Evaluation ────────────────────────────────────────────────

  describe('Policy Evaluation', () => {
    it('should DENY restricted data with external model (built-in policy)', () => {
      const result = engine.evaluatePolicy({
        tenantId,
        principalId: 'agent_sales',
        principalType: 'AGENT',
        agentId: 'agent_sales',
        resourceType: 'document',
        resourceId: 'doc_confidential_123',
        resourceClassification: 'RESTRICTED',
        action: 'READ',
        riskLevel: 'T2',
        environment: {},
        modelProvider: 'openai',
      });

      expect(result.effect).toBe('DENY');
      expect(result.reason).toBeTruthy();
    });

    it('should REQUIRE_APPROVAL for high-risk actions (built-in policy)', () => {
      const result = engine.evaluatePolicy({
        tenantId,
        principalId: 'agent_pricing',
        principalType: 'AGENT',
        agentId: 'agent_pricing',
        resourceType: 'pricing_table',
        resourceId: 'pricing_001',
        resourceClassification: 'INTERNAL',
        action: 'WRITE',
        riskLevel: 'T4',
        environment: {},
      });

      expect(result.effect).toBe('REQUIRE_APPROVAL');
    });

    it('should REDUCE_TRUST for stale data sources (built-in policy)', () => {
      const result = engine.evaluatePolicy({
        tenantId,
        principalId: 'agent_research',
        principalType: 'AGENT',
        resourceType: 'data_source',
        resourceId: 'crm_data',
        resourceClassification: 'INTERNAL',
        action: 'READ',
        riskLevel: 'T1',
        environment: {},
        sourceFreshness: 100000000, // >24h stale
      });

      expect(result.effect).toBe('REDUCE_TRUST');
    });

    it('should ALLOW normal operations that match no deny rules', () => {
      const result = engine.evaluatePolicy({
        tenantId,
        principalId: 'user_alice',
        principalType: 'USER',
        resourceType: 'document',
        resourceId: 'doc_public_001',
        resourceClassification: 'PUBLIC',
        action: 'READ',
        riskLevel: 'T0',
        environment: {},
      });

      expect(result.effect).toBe('ALLOW');
    });
  });

  // ─── Risk Tier Calculation ─────────────────────────────────────────────

  describe('Risk Tier Calculation', () => {
    it('should calculate LOW risk for benign operations', () => {
      const result = engine.evaluateRiskTier({
        tenantId,
        agentId: 'agent_reader',
        actionType: 'READ',
        dataSensitivity: 1,
        autonomy: 0,
        externalEffects: 0,
        financialImpact: 0,
        customerImpact: 1,
        reversibility: 9,
      });

      expect(result.tier).toBe('LOW');
      expect(result.score).toBeLessThan(2.5);
      expect(result.allowed).toBe(true);
      expect(result.factors.length).toBeGreaterThan(0);
    });

    it('should calculate CRITICAL risk for high-impact autonomous actions', () => {
      const result = engine.evaluateRiskTier({
        tenantId,
        agentId: 'agent_contract_signer',
        actionType: 'CONTRACTUAL',
        dataSensitivity: 9,
        autonomy: 9,
        externalEffects: 8,
        financialImpact: 10,
        customerImpact: 8,
        reversibility: 1,
      });

      expect(result.tier).toBe('CRITICAL');
      expect(result.score).toBeGreaterThanOrEqual(7.5);
      expect(result.factors.some((f) => f.name === 'financialImpact')).toBe(true);
    });

    it('should provide contribution breakdown for each factor', () => {
      const result = engine.evaluateRiskTier({
        tenantId,
        agentId: 'agent_mid',
        actionType: 'WRITE',
        dataSensitivity: 5,
        autonomy: 5,
        externalEffects: 5,
        financialImpact: 5,
        customerImpact: 5,
        reversibility: 5,
      });

      expect(result.factors.length).toBe(6);
      const totalContribution = result.factors.reduce((sum, f) => sum + f.contribution, 0);
      expect(totalContribution).toBeCloseTo(result.score, 1);
    });
  });

  // ─── Policy-as-Code Testing ────────────────────────────────────────────

  describe('Policy Testing', () => {
    it('should run deterministic test cases against a policy', () => {
      const policy = engine.registerPolicy(tenantId, {
        name: 'Testable Policy',
        description: 'Policy for testing',
        rules: [
          {
            id: 'rule_block_delete',
            name: 'Block DELETE on CONFIDENTIAL',
            description: 'Prevents deletion of confidential resources',
            conditions: [
              { field: 'action', operator: 'eq', value: 'DELETE' },
              { field: 'resourceClassification', operator: 'eq', value: 'CONFIDENTIAL' },
            ],
            effect: 'DENY',
            priority: 100,
            requiresAudit: true,
          },
        ],
        version: 1,
        status: 'ACTIVE',
        environment: 'test',
      });

      const results = engine.testPolicy(policy.id, [
        {
          context: {
            tenantId,
            principalId: 'user_test',
            principalType: 'USER',
            resourceType: 'document',
            resourceId: 'doc_1',
            resourceClassification: 'CONFIDENTIAL',
            action: 'DELETE',
            riskLevel: 'T2',
            environment: {},
          },
          expectedEffect: 'DENY',
        },
        {
          context: {
            tenantId,
            principalId: 'user_test',
            principalType: 'USER',
            resourceType: 'document',
            resourceId: 'doc_2',
            resourceClassification: 'PUBLIC',
            action: 'READ',
            riskLevel: 'T0',
            environment: {},
          },
          expectedEffect: 'ALLOW',
        },
      ]);

      expect(results.passed).toBe(2);
      expect(results.failed).toBe(0);
    });
  });
});
