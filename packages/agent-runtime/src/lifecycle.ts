/**
 * ShiVi X100+ Agent Runtime — Agent Lifecycle State Machine
 * Standard: SAD v2.0 §15, TDA v1.1 §42, FTL-KER-006
 */

export type AgentState =
  | 'DRAFT'
  | 'EVALUATING'
  | 'SECURITY_REVIEW'
  | 'STAGING'
  | 'CANARY'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'QUARANTINED'
  | 'REVOKED'
  | 'RETIRED';

export interface AgentManifest {
  agentId: string;
  agentVersion: string;
  tenantId: string;
  name: string;
  description: string;
  maxTrajectorySteps: number;
  allowedTools: string[];
  maxRiskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  state: AgentState;
  quarantineReason?: string;
  createdAt: number;
  updatedAt: number;
}

export class AgentLifecycleManager {
  private static agentRegistry = new Map<string, AgentManifest>();

  /**
   * Register new agent in DRAFT state
   */
  public static registerAgent(
    agentId: string,
    agentVersion: string,
    tenantId: string,
    name: string,
    description: string,
    allowedTools: string[],
    maxRiskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'
  ): AgentManifest {
    const key = `${tenantId}:${agentId}:${agentVersion}`;
    const now = Date.now();

    const manifest: AgentManifest = {
      agentId,
      agentVersion,
      tenantId,
      name,
      description,
      maxTrajectorySteps: 10,
      allowedTools,
      maxRiskLevel,
      state: 'DRAFT',
      createdAt: now,
      updatedAt: now,
    };

    this.agentRegistry.set(key, manifest);
    return manifest;
  }

  /**
   * Get registered agent manifest
   */
  public static getAgent(tenantId: string, agentId: string, agentVersion: string): AgentManifest | undefined {
    return this.agentRegistry.get(`${tenantId}:${agentId}:${agentVersion}`);
  }

  /**
   * Transition agent state with strict transition validation
   */
  public static transitionState(
    tenantId: string,
    agentId: string,
    agentVersion: string,
    targetState: AgentState,
    reason?: string
  ): AgentManifest {
    const agent = this.getAgent(tenantId, agentId, agentVersion);
    if (!agent) {
      throw new Error(`Agent '${agentId}' (${agentVersion}) not found for tenant '${tenantId}'`);
    }

    // Direct transition to QUARANTINED, REVOKED, or RETIRED is always allowed
    if (targetState === 'QUARANTINED') {
      agent.state = 'QUARANTINED';
      agent.quarantineReason = reason ?? 'Safety policy breach trigger.';
      agent.updatedAt = Date.now();
      return agent;
    }

    const validTransitions: Record<AgentState, AgentState[]> = {
      DRAFT: ['EVALUATING', 'RETIRED'],
      EVALUATING: ['SECURITY_REVIEW', 'DRAFT', 'RETIRED'],
      SECURITY_REVIEW: ['STAGING', 'DRAFT', 'RETIRED'],
      STAGING: ['CANARY', 'RETIRED'],
      CANARY: ['ACTIVE', 'DEGRADED', 'RETIRED'],
      ACTIVE: ['DEGRADED', 'QUARANTINED', 'REVOKED', 'RETIRED'],
      DEGRADED: ['ACTIVE', 'QUARANTINED', 'REVOKED', 'RETIRED'],
      QUARANTINED: ['SECURITY_REVIEW', 'REVOKED', 'RETIRED'],
      REVOKED: ['RETIRED'],
      RETIRED: [],
    };

    const allowed = validTransitions[agent.state] || [];
    if (!allowed.includes(targetState)) {
      throw new Error(`Invalid lifecycle transition for agent '${agentId}': ${agent.state} -> ${targetState}`);
    }

    agent.state = targetState;
    agent.updatedAt = Date.now();
    return agent;
  }
}
