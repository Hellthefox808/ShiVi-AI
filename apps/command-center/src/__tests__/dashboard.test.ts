import { describe, it, expect } from 'vitest';
import { CommandCenterDashboard } from '../index.js';
import { AgentLifecycleManager } from '@shivi/agent-runtime';

describe('ShiVi Command Center Dashboard Application Suite', () => {
  it('should render dashboard view model with active and quarantined agents', () => {
    const ag1 = AgentLifecycleManager.registerAgent('dash-ag-1', 'v1', 'tenant-dash', 'Dash Agent 1', 'Desc', [], 'T1');
    AgentLifecycleManager.transitionState('tenant-dash', 'dash-ag-1', 'v1', 'EVALUATING');
    AgentLifecycleManager.transitionState('tenant-dash', 'dash-ag-1', 'v1', 'SECURITY_REVIEW');
    AgentLifecycleManager.transitionState('tenant-dash', 'dash-ag-1', 'v1', 'STAGING');
    AgentLifecycleManager.transitionState('tenant-dash', 'dash-ag-1', 'v1', 'CANARY');

    const vm = CommandCenterDashboard.renderDashboardState('tenant-dash', [ag1]);

    expect(vm.shellState.activeSystemId).toBe('41');
    expect(vm.activeAgents.length).toBe(1);
    expect(vm.evidenceIntegrityValid).toBe(true);
    expect(vm.systemStatusText).toBe('ALL_SYSTEMS_OPERATIONAL');
    expect(vm.themeTokens.colors.primary).toBe('#3b82f6');
  });
});
