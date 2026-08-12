/**
 * ShiVi X100+ Kernel — Authorization & Policy Primitives
 * Standard: SAD v2.0 §9, TDA v1.1 §9, FTL-KER-004
 */

export interface AuthorizationTuple {
  tenantId: string;
  user: string; // e.g. "user:alice", "agent:sales-bot"
  relation: string; // e.g. "viewer", "editor", "owner", "executor"
  object: string; // e.g. "document:doc_123", "tool:mcp_sql_query"
}

export interface PolicyEvaluationInput {
  tenantId: string;
  principal: {
    id: string;
    type: string;
    roles: string[];
  };
  resource: {
    type: string;
    id: string;
    classification: string;
  };
  action: string;
  environment: Record<string, string | number | boolean>;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason?: string;
  policyId: string;
  evaluatedAt: number;
}

export class AuthorizationEngine {
  private static tupleStore: AuthorizationTuple[] = [];

  /**
   * Add authorization tuple (OpenFGA model)
   */
  public static addTuple(tuple: AuthorizationTuple): void {
    this.tupleStore.push(tuple);
  }

  /**
   * Check relationship tuple
   */
  public static checkRelationship(
    tenantId: string,
    user: string,
    relation: string,
    object: string
  ): boolean {
    return this.tupleStore.some(
      (t) =>
        t.tenantId === tenantId &&
        t.user === user &&
        t.relation === relation &&
        t.object === object
    );
  }

  /**
   * Evaluate Policy-as-Code (OPA model adapter)
   */
  public static evaluatePolicy(
    policyId: string,
    input: PolicyEvaluationInput
  ): PolicyEvaluationResult {
    const now = Date.now();

    // Default policy rule: Restricted resources require explicit security roles
    if (input.resource.classification === 'RESTRICTED') {
      const hasSecurityRole = input.principal.roles.some((r) =>
        ['secops', 'admin', 'compliance-officer'].includes(r)
      );
      if (!hasSecurityRole) {
        return {
          allowed: false,
          reason: `Access to RESTRICTED resource '${input.resource.id}' denied for roles: [${input.principal.roles.join(', ')}]`,
          policyId,
          evaluatedAt: now,
        };
      }
    }

    return {
      allowed: true,
      reason: 'Policy passed default rules.',
      policyId,
      evaluatedAt: now,
    };
  }
}
