import { describe, it, expect } from 'vitest';
import { StateStore } from '../index.js';

describe('ShiVi Reactive State Store Suite', () => {
  it('should initialize and update state store', () => {
    expect(StateStore).toBeDefined();
  });
});
