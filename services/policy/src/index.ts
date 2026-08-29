/**
 * ShiVi Policy Engine — Executable Policy-as-Code & Data Foundation
 * Replaces hardcoded stubs with real condition evaluation, risk calculation,
 * and enterprise data governance primitives.
 */
import { randomUUID } from 'node:crypto';

export type PolicyStatus = 'DRAFT' | 'TEST' | 'APPROVED' | 'ACTIVE' | 'RETIRED';
export type PolicyEffect = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REDACT' | 'ESCALATE' | 'REDUCE_TRUST';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'matches';
export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface PolicyCondition {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  conditions: PolicyCondition[];
  effect: PolicyEffect;
  priority: number;
  requiresAudit: boolean;
}

export interface PolicyDefinition {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  version: number;
  status: PolicyStatus;
  environment: string;
  createdAt: number;
  updatedAt: number;
}

export interface PolicyEvaluationContext {
  tenantId: string;
  principalId: string;
  principalType: 'USER' | 'AGENT' | 'SERVICE';
  agentId?: string;
  resourceType: string;
  resourceId: string;
  resourceClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  action: string;
  riskLevel: string;
  environment: Record<string, unknown>;
  sourceFreshness?: number;
  modelProvider?: string;
}

export interface PolicyEvaluationResult {
  effect: PolicyEffect;
  matchedRuleId: string | null;
  matchedPolicyId: string | null;
  reason: string;
  evaluatedAt: number;
  auditRequired: boolean;
}

export interface RiskEvaluationRequest {
  tenantId: string;
  agentId: string;
  actionType: string;
  dataSensitivity: number;
  autonomy: number;
  externalEffects: number;
  financialImpact: number;
  customerImpact: number;
  reversibility: number;
}

export interface RiskEvaluationResult {
  tier: RiskTier;
  score: number;
  allowed: boolean;
  reason: string;
  factors: Array<{ name: string; value: number; contribution: number }>;
}

export class PolicyEngine {
  private policies: Map<string, PolicyDefinition> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const sys = 'SYSTEM';

    // 1. Restricted data + external model → DENY
    this.registerPolicy(sys, {
      name: 'Restricted External Models',
      description: 'Deny restricted resources for external model providers',
      version: 1, status: 'ACTIVE', environment: 'ALL',
      rules: [{
        id: 'rule_restricted_external', name: 'Deny Restricted External',
        description: 'Deny if resource RESTRICTED and model provider is not shivi-internal',
        effect: 'DENY', priority: 100, requiresAudit: true,
        conditions: [
          { field: 'resourceClassification', operator: 'eq', value: 'RESTRICTED' },
          { field: 'modelProvider', operator: 'neq', value: 'shivi-internal' },
        ],
      }],
    });

    // 2. High-risk action → REQUIRE_APPROVAL
    this.registerPolicy(sys, {
      name: 'High Risk Approval Gate',
      description: 'Require human approval for T3/T4/T5 risk operations',
      version: 1, status: 'ACTIVE', environment: 'ALL',
      rules: [{
        id: 'rule_high_risk_approval', name: 'High Risk Approval',
        description: 'Require approval for high risk levels',
        effect: 'REQUIRE_APPROVAL', priority: 90, requiresAudit: true,
        conditions: [
          { field: 'riskLevel', operator: 'in', value: ['T3', 'T4', 'T5'] },
        ],
      }],
    });

    // 3. Stale source → REDUCE_TRUST
    this.registerPolicy(sys, {
      name: 'Stale Source Trust Reduction',
      description: 'Reduce trust when data source freshness exceeds 24 hours',
      version: 1, status: 'ACTIVE', environment: 'ALL',
      rules: [{
        id: 'rule_stale_source', name: 'Stale Source',
        description: 'Reduce trust if sourceFreshness > 86400000ms (24h)',
        effect: 'REDUCE_TRUST', priority: 70, requiresAudit: false,
        conditions: [
          { field: 'sourceFreshness', operator: 'gt', value: 86400000 },
        ],
      }],
    });

    // 4. Audit-required mutations
    this.registerPolicy(sys, {
      name: 'Audit Required Mutations',
      description: 'Flag mutations for audit trail recording',
      version: 1, status: 'ACTIVE', environment: 'ALL',
      rules: [{
        id: 'rule_audit_mutations', name: 'Audit Mutations',
        description: 'Require audit for destructive/communicative actions',
        effect: 'ALLOW', priority: 50, requiresAudit: true,
        conditions: [
          { field: 'action', operator: 'in', value: ['DELETE', 'SEND', 'PUBLISH', 'CHANGE_PERMISSIONS'] },
        ],
      }],
    });
  }

  registerPolicy(tenantId: string, policy: Omit<PolicyDefinition, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): PolicyDefinition {
    const id = `pol_${randomUUID()}`;
    const now = Date.now();
    const def: PolicyDefinition = {
      ...policy,
      id,
      tenantId,
      createdAt: now,
      updatedAt: now,
    };
    this.policies.set(`${tenantId}:${id}`, def);
    return def;
  }

  activatePolicy(tenantId: string, policyId: string): PolicyDefinition {
    const key = `${tenantId}:${policyId}`;
    const policy = this.policies.get(key);
    if (!policy) throw new Error('Policy not found');
    if (policy.status !== 'APPROVED') throw new Error('Policy must be APPROVED to activate');
    policy.status = 'ACTIVE';
    policy.updatedAt = Date.now();
    return policy;
  }

  retirePolicy(tenantId: string, policyId: string): PolicyDefinition {
    const key = `${tenantId}:${policyId}`;
    const policy = this.policies.get(key);
    if (!policy) throw new Error('Policy not found');
    policy.status = 'RETIRED';
    policy.updatedAt = Date.now();
    return policy;
  }

  getPolicy(policyId: string): PolicyDefinition | null {
    for (const policy of this.policies.values()) {
      if (policy.id === policyId) return policy;
    }
    return null;
  }

  listPolicies(tenantId: string): PolicyDefinition[] {
    return Array.from(this.policies.values()).filter(p => p.tenantId === tenantId);
  }

  private getNestedValue(obj: any, path: string): unknown {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  evaluateCondition(condition: PolicyCondition, context: PolicyEvaluationContext): boolean {
    const value = this.getNestedValue(context, condition.field);
    const expected = condition.value;

    switch (condition.operator) {
      case 'eq': return value === expected;
      case 'neq': return value !== expected;
      case 'gt': return typeof value === 'number' && typeof expected === 'number' && value > expected;
      case 'lt': return typeof value === 'number' && typeof expected === 'number' && value < expected;
      case 'gte': return typeof value === 'number' && typeof expected === 'number' && value >= expected;
      case 'lte': return typeof value === 'number' && typeof expected === 'number' && value <= expected;
      case 'in': return Array.isArray(expected) && expected.includes(value);
      case 'not_in': return Array.isArray(expected) && !expected.includes(value);
      case 'contains': return typeof value === 'string' && typeof expected === 'string' && value.includes(expected);
      case 'matches': return typeof value === 'string' && typeof expected === 'string' && new RegExp(expected).test(value);
      default: return false;
    }
  }

  evaluatePolicy(context: PolicyEvaluationContext): PolicyEvaluationResult {
    // Collect both tenant-specific and universal SYSTEM policies
    const tenantPolicies = this.listPolicies(context.tenantId).filter(p => p.status === 'ACTIVE');
    const systemPolicies = this.listPolicies('SYSTEM').filter(p => p.status === 'ACTIVE');
    const allPolicies = [...tenantPolicies, ...systemPolicies];
    
    const allRules: { policyId: string, rule: PolicyRule }[] = [];
    for (const policy of allPolicies) {
      for (const rule of policy.rules) {
        allRules.push({ policyId: policy.id, rule });
      }
    }
    
    allRules.sort((a, b) => b.rule.priority - a.rule.priority);

    for (const { policyId, rule } of allRules) {
      const matchedAll = rule.conditions.every(cond => this.evaluateCondition(cond, context));
      if (matchedAll) {
        return {
          effect: rule.effect,
          matchedRuleId: rule.id,
          matchedPolicyId: policyId,
          reason: `Matched rule ${rule.name}`,
          evaluatedAt: Date.now(),
          auditRequired: rule.requiresAudit
        };
      }
    }

    return {
      effect: 'ALLOW',
      matchedRuleId: null,
      matchedPolicyId: null,
      reason: 'No policies matched',
      evaluatedAt: Date.now(),
      auditRequired: false
    };
  }

  evaluateRiskTier(request: RiskEvaluationRequest): RiskEvaluationResult {
    const factors = [
      { name: 'dataSensitivity', value: request.dataSensitivity, weight: 0.25 },
      { name: 'autonomy', value: request.autonomy, weight: 0.20 },
      { name: 'externalEffects', value: request.externalEffects, weight: 0.15 },
      { name: 'financialImpact', value: request.financialImpact, weight: 0.20 },
      { name: 'customerImpact', value: request.customerImpact, weight: 0.10 },
      { name: 'reversibility', value: request.reversibility, weight: 0.10, inverted: true }
    ];

    let score = 0;
    const factorResults = factors.map(f => {
      const val = f.inverted ? (10 - f.value) : f.value;
      const contribution = val * f.weight;
      score += contribution;
      return { name: f.name, value: f.value, contribution };
    });

    let tier: RiskTier = 'LOW';
    if (score > 7.5) tier = 'CRITICAL';
    else if (score > 5) tier = 'HIGH';
    else if (score > 2.5) tier = 'MEDIUM';

    return {
      tier,
      score,
      allowed: tier !== 'CRITICAL',
      reason: `Evaluated risk tier: ${tier}`,
      factors: factorResults
    };
  }

  testPolicy(policyId: string, testCases: Array<{ context: PolicyEvaluationContext; expectedEffect: PolicyEffect }>) {
    const policy = this.getPolicy(policyId);
    if (!policy) throw new Error('Policy not found');

    let passed = 0;
    let failed = 0;
    const results = [];

    for (const test of testCases) {
      let actualEffect: PolicyEffect = 'ALLOW';
      const sortedRules = [...policy.rules].sort((a, b) => b.priority - a.priority);
      for (const rule of sortedRules) {
        if (rule.conditions.every(cond => this.evaluateCondition(cond, test.context))) {
          actualEffect = rule.effect;
          break;
        }
      }
      const isPass = actualEffect === test.expectedEffect;
      if (isPass) passed++; else failed++;
      results.push({ passed: isPass, expected: test.expectedEffect, actual: actualEffect });
    }

    return { passed, failed, results };
  }

  // ─── Backward Compatibility ─────────────────────────────────────────
  // Legacy PolicyService methods for existing tests

  /**
   * @deprecated Use registerPolicy() instead
   */
  async createPolicy(def: { name: string; description: string; rules: any[]; version: number; active: boolean }): Promise<{ id: string; name: string; rules: any[]; description: string }> {
    const policy = this.registerPolicy('default', {
      name: def.name,
      description: def.description,
      rules: def.rules.map((r: any) => ({
        id: r.id || `rule_${Math.random().toString(36).substring(2, 9)}`,
        name: r.name || 'Legacy Rule',
        description: r.condition || '',
        conditions: [],
        effect: r.effect === 'deny' ? 'DENY' as PolicyEffect : 'ALLOW' as PolicyEffect,
        priority: 50,
        requiresAudit: false,
      })),
      version: def.version,
      status: def.active ? 'ACTIVE' : 'DRAFT',
      environment: 'default',
    });
    return { id: policy.id, name: policy.name, rules: policy.rules, description: policy.description };
  }
}

export const PolicyService = PolicyEngine;
export default PolicyEngine;
