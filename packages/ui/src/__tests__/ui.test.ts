import { describe, it, expect } from 'vitest';
import { ShiViDesignTokens, ShellNavigationEngine } from '../index.js';

describe('ShiVi UI/UX Design System & 3-Level Shell Suite', () => {
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
