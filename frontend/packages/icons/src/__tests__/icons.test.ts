import { describe, it, expect } from 'vitest';
import { ShiViIcons } from '../index.js';

describe('ShiVi Icon Library Suite', () => {
  it('should export all system icons', () => {
    expect(ShiViIcons).toBeDefined();
  });
});
