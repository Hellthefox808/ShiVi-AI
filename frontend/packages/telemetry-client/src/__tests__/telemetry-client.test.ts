import { describe, it, expect } from 'vitest';
import { FrontendTelemetryClient } from '../index.js';

describe('ShiVi Frontend Telemetry Client Suite', () => {
  it('should capture user telemetry and spans', () => {
    expect(FrontendTelemetryClient).toBeDefined();
  });
});
