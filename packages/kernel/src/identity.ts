/**
 * ShiVi X100+ Kernel — Identity Architecture Primitives
 * Standard: SAD v2.0 §8.1, TDA v1.1 §8, FTL-KER-002
 */

export type IdentityType = 'HUMAN' | 'SERVICE' | 'AGENT' | 'TOOL' | 'WORKLOAD';

export interface SpiffeIdentity {
  trustDomain: string;
  namespace: string;
  serviceAccount: string;
  rawSpiffeId: string;
}

export interface PrincipalIdentity {
  id: string;
  type: IdentityType;
  tenantId: string;
  organizationId: string;
  roles: string[];
  attributes: Record<string, string | number | boolean>;
  spiffe?: SpiffeIdentity;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
}

export class InvalidIdentityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIdentityError';
  }
}

export class IdentityContext {
  /**
   * Parse and validate a SPIFFE ID format: spiffe://<trust-domain>/ns/<namespace>/sa/<service-account>
   */
  public static parseSpiffeId(spiffeUri: string): SpiffeIdentity {
    const regex = /^spiffe:\/\/([^\/]+)\/ns\/([^\/]+)\/sa\/([^\/]+)$/;
    const match = spiffeUri.match(regex);
    if (!match) {
      throw new InvalidIdentityError(`Invalid SPIFFE URI format: '${spiffeUri}'`);
    }
    return {
      trustDomain: match[1],
      namespace: match[2],
      serviceAccount: match[3],
      rawSpiffeId: spiffeUri,
    };
  }

  /**
   * Create an Agent Identity principal
   */
  public static createAgentPrincipal(
    agentId: string,
    agentVersion: string,
    tenantId: string,
    organizationId: string,
    spiffeUri?: string
  ): PrincipalIdentity {
    const now = Math.floor(Date.now() / 1000);
    return {
      id: `agent:${agentId}:${agentVersion}`,
      type: 'AGENT',
      tenantId,
      organizationId,
      roles: ['agent:executor'],
      attributes: { agentId, agentVersion },
      spiffe: spiffeUri ? this.parseSpiffeId(spiffeUri) : undefined,
      issuer: 'shivi-agent-control-plane',
      issuedAt: now,
      expiresAt: now + 3600,
    };
  }

  /**
   * Validate token expiration and principal validity
   */
  public static validatePrincipal(principal: PrincipalIdentity): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (principal.expiresAt <= now) {
      return false;
    }
    if (!principal.id || !principal.tenantId || !principal.organizationId) {
      return false;
    }
    return true;
  }
}
