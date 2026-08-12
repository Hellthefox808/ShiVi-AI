/**
 * ShiVi X100+ Command Center Dashboard Application
 * Standard: SAD v2.0 §38, UI/UX Specification v1.0 §2.1-2.4
 */

import { ShellNavigationEngine, GlobalShellState, ShiViDesignTokens } from '@shivi/ui';
import { AgentManifest } from '@shivi/agent-runtime';
import { EvidenceLedger } from '@shivi/security';

export interface CommandCenterDashboardViewModel {
  shellState: GlobalShellState;
  activeAgents: AgentManifest[];
  quarantinedAgents: AgentManifest[];
  evidenceIntegrityValid: boolean;
  systemStatusText: string;
  themeTokens: typeof ShiViDesignTokens;
}

export class CommandCenterDashboard {
  public static renderDashboardState(
    tenantId: string,
    agents: AgentManifest[] = []
  ): CommandCenterDashboardViewModel {
    const shellState = ShellNavigationEngine.createDefaultShellState(tenantId);
    const tenantAgents = agents.filter((a) => a.tenantId === tenantId);

    const activeAgents = tenantAgents.filter((a) => a.state === 'ACTIVE' || a.state === 'CANARY');
    const quarantinedAgents = tenantAgents.filter((a) => a.state === 'QUARANTINED');

    const evidenceIntegrityValid = EvidenceLedger.verifyChainIntegrity();

    return {
      shellState,
      activeAgents,
      quarantinedAgents,
      evidenceIntegrityValid,
      systemStatusText: evidenceIntegrityValid ? 'ALL_SYSTEMS_OPERATIONAL' : 'EVIDENCE_CHAIN_DEGRADED',
      themeTokens: ShiViDesignTokens,
    };
  }
}
