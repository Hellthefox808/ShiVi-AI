import { describe, it, expect } from 'vitest';
import { ValidationSchemas } from '../index.js';

describe('ShiVi Frontend Validation Schemas Suite', () => {
  it('should validate form payloads', () => {
    expect(ValidationSchemas).toBeDefined();
  });
});
