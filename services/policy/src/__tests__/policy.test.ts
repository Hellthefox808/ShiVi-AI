import { describe, it, expect } from 'vitest';
import { PolicyService } from '../index.js';

describe('PolicyService Governance Suite', () => {
  const service = new PolicyService();

  it('should evaluate risk tier for context payload', async () => {
    const result = await service.evaluateRiskTier({
      tenantId: 'tenant_prod',
      agentId: 'agent_sql_exec',
      actionType: 'database_write',
      payload: { sql: 'SELECT * FROM users' },
    });
    expect(result.tier).toBeDefined();
    expect(result.allowed).toBe(true);
  });

  it('should create and retrieve a policy definition', async () => {
    const policy = await service.createPolicy({
      name: 'Strict PII Masking',
      description: 'Disallow plain PII in prompt context',
      rules: [
        { id: 'rule_1', name: 'Mask SSN', condition: 'contains(ssn)', effect: 'deny', riskTier: 'critical' }
      ],
      version: 1,
      active: true,
    });
    expect(policy.id).toBeDefined();
    expect(policy.rules.length).toBe(1);

    const retrieved = await service.getPolicy(policy.id);
    expect(retrieved).not.toBeNull();
  });
});
