import { describe, it, expect } from 'vitest';
import { GTMService } from '../index.js';

describe('GTMService Enterprise Suite', () => {
  const service = new GTMService();

  it('should evaluate Ideal Customer Profile (ICP) match score', async () => {
    const match = await service.scoreICPMatch({
      industry: 'Enterprise SaaS',
      annualRevenueUSD: 50000000,
      employeeCount: 300,
      techStack: ['Kubernetes', 'PostgreSQL', 'Redis'],
    });
    expect(match.matchPercentage).toBeGreaterThan(80);
    expect(match.tier).toBe('Tier 1');
  });

  it('should estimate Total Addressable Market (TAM)', async () => {
    const tam = await service.calculateTAM('enterprise_ai_operating_systems');
    expect(tam.tamUSD).toBeGreaterThan(1000000000);
  });
});
