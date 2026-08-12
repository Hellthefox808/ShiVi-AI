import { describe, it, expect } from 'vitest';
import { ShiViServiceGenerator } from '../index.js';

describe('ShiVi Developer Platform CLI Suite', () => {
  it('should generate standardized golden path service scaffold for shivi create service', () => {
    const res = ShiViServiceGenerator.createServiceScaffold('revenue-intelligence', 'CORE');

    expect(res.serviceName).toBe('revenue-intelligence');
    expect(res.goldenPathTier).toBe('CORE');
    expect(res.filesGenerated.length).toBe(14);
    expect(res.openApiSpecPath).toContain('openapi.yaml');
    expect(res.sbomPath).toContain('sbom.json');
    expect(res.sloPath).toContain('SLO.md');
  });
});
