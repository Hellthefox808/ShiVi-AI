/**
 * ShiVi X100+ UI/UX — 3-Level Shell Navigation Engine
 * Standard: UI/UX Specification v1.0 §2.1-2.4
 */

export interface SystemAppMeta {
  id: string; // e.g. "01", "41", "61"
  name: string;
  domain: string;
  icon: string;
}

export interface DomainNavigationItem {
  id: string;
  label: string;
  route: string;
  badgeCount?: number;
}

export interface GlobalShellState {
  activeSystemId: string;
  activeDomainRoute: string;
  densityMode: 'COMPACT' | 'COMFORTABLE' | 'SPACIOUS';
  agentCommandCenterOpen: boolean;
  tenantId: string;
}

export class ShellNavigationEngine {
  private static registeredSystems: SystemAppMeta[] = [
    { id: '01', name: 'AI GTM Operating System', domain: 'Business', icon: 'rocket' },
    { id: '02', name: 'Autonomous RevOps Engine', domain: 'Business', icon: 'chart-bar' },
    { id: '04', name: 'AI CRM Copilot', domain: 'Business', icon: 'users' },
    { id: '41', name: 'ShiVi Agent Control Plane', domain: 'Platform', icon: 'cpu' },
    { id: '61', name: 'ShiVi AI Gateway', domain: 'AI Platform', icon: 'network' },
  ];

  public static getSystems(): SystemAppMeta[] {
    return this.registeredSystems;
  }

  public static createDefaultShellState(tenantId: string): GlobalShellState {
    return {
      activeSystemId: '41',
      activeDomainRoute: '/agent-control-plane/dashboard',
      densityMode: 'COMFORTABLE',
      agentCommandCenterOpen: true,
      tenantId,
    };
  }

  public static switchSystem(currentState: GlobalShellState, targetSystemId: string): GlobalShellState {
    const sys = this.registeredSystems.find((s) => s.id === targetSystemId);
    if (!sys) {
      throw new Error(`System '${targetSystemId}' not found in registered system launcher.`);
    }

    return {
      ...currentState,
      activeSystemId: targetSystemId,
      activeDomainRoute: `/${sys.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/dashboard`,
    };
  }
}
