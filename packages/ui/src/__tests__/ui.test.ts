import { describe, it, expect } from 'vitest';
import { ShiViDesignTokens, ShellNavigationEngine, EdgeStatesRegistry, EdgeStateKind } from '../index.js';


describe('ShiVi UI/UX Design System & 3-Level Shell Suite', () => {
  it('should render all 18 edge states correctly', () => {
    const kinds: EdgeStateKind[] = [
      'loading', 'skeleton', 'empty', 'partial', 'success', 'warning', 'error',
      'retry', 'offline', 'degraded', 'unauthorized', 'forbidden', 'approval-required',
      'expired', 'conflict', 'quarantined', 'recovering', 'cancelled'
    ];

    for (const kind of kinds) {
      const res = EdgeStatesRegistry.renderState(kind);
      expect(res.descriptor.kind).toBe(kind);
      expect(res.descriptor.title).toBeDefined();
      expect(res.descriptor.message).toBeDefined();
    }
  });

  it('should expose correct surface and color design tokens', () => {

    expect(ShiViDesignTokens.surfaces.background).toBe('#090d16');
    expect(ShiViDesignTokens.colors.primary).toBe('#3b82f6');
  });

  it('should initialize default shell state and switch systems cleanly', () => {
    const initialState = ShellNavigationEngine.createDefaultShellState('tenant-ui');
    expect(initialState.activeSystemId).toBe('41');

    const newState = ShellNavigationEngine.switchSystem(initialState, '01');
    expect(newState.activeSystemId).toBe('01');
    expect(newState.activeDomainRoute).toContain('ai-gtm-operating-system');
  });
});
