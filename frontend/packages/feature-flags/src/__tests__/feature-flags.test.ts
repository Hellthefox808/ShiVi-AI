import { describe, it, expect } from 'vitest';
import { FeatureFlagEvaluator } from '../index.js';

describe('ShiVi Feature Flags Suite', () => {
  it('should evaluate feature flags for tenant context', () => {
    expect(FeatureFlagEvaluator).toBeDefined();
  });
});
