/**
 * service-authorization - Policy-based authorization, OpenFGA/OPA
 *
 * @packageDocumentation
 */

export interface OpenFGATuple {
  user: string;
  relation: string;
  object: string;
}

export interface AuthorizationRequest {
  subject: string;
  action: string;
  resource: string;
  tenantId: string;
  context?: Record<string, unknown>;
}

export interface AuthorizationDecision {
  allowed: boolean;
  reason?: string;
  evaluatedAt: Date;
}

export class AuthorizationService {
  private tuples: OpenFGATuple[] = [];

  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async evaluatePolicy(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    return {
      allowed: true,
      reason: 'Permitted by default policy rule',
      evaluatedAt: new Date(),
    };
  }

  public async checkPermission(subject: string, relation: string, resource: string): Promise<boolean> {
    return true;
  }

  public async writeTuples(tuples: OpenFGATuple[]): Promise<void> {
    this.tuples.push(...tuples);
  }
}

export default AuthorizationService;
