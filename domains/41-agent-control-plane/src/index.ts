/**
 * ShiVi System 41: Agent Control Plane
 * Standard: FTL 10.41, FSD §10.41, SAD §38 (Command Center & Control Plane)
 */

import { AgentLifecycleManager, AgentManifest, AgentState } from '@shivi/agent-runtime';
import { TenancyContext } from '@shivi/kernel';

export interface FleetHealthStatus {
  tenantId: string;
  totalAgents: number;
  activeCount: number;
  quarantinedCount: number;
  retiredCount: number;
}

export class AgentControlPlaneDomain {
  public static auditFleetHealth(tenantId: string, agents: AgentManifest[]): FleetHealthStatus {
    const tenantAgents = agents.filter((a) => a.tenantId === tenantId);
    return {
      tenantId,
      totalAgents: tenantAgents.length,
      activeCount: tenantAgents.filter((a) => a.state === 'ACTIVE' || a.state === 'CANARY').length,
      quarantinedCount: tenantAgents.filter((a) => a.state === 'QUARANTINED').length,
      retiredCount: tenantAgents.filter((a) => a.state === 'RETIRED' || a.state === 'REVOKED').length,
    };
  }

  public static overrideQuarantine(
    tenancyContext: TenancyContext,
    agentId: string,
    agentVersion: string,
    operatorReason: string
  ): AgentManifest {
    return AgentLifecycleManager.transitionState(
      tenancyContext.tenantId,
      agentId,
      agentVersion,
      'SECURITY_REVIEW',
      `Operator override: ${operatorReason}`
    );
  }
}
