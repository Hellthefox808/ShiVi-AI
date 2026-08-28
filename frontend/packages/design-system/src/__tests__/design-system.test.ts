import { describe, it, expect } from 'vitest';
import { DesignSystemTokens } from '../index.js';

describe('ShiVi Design System Tokens Suite', () => {
  it('should expose theme variables and design tokens', () => {
    expect(DesignSystemTokens).toBeDefined();
  });
});
