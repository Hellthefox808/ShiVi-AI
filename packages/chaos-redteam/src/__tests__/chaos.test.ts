import { describe, it, expect } from 'vitest';
import { ChaosRedTeamSuite } from '../index.js';

describe('ShiVi Continuous Chaos, Red-Team & Adversarial Attack Suite', () => {
  it('should run full red-team audit and contain 100% of adversarial attacks', async () => {
    const report = await ChaosRedTeamSuite.runFullRedTeamAudit('tenant-chaos-a', 'tenant-chaos-b');

    expect(report.totalAttacksExecuted).toBe(6);
    expect(report.totalAttacksContained).toBe(6);
    expect(report.containmentRatePercent).toBe(100);
    expect(report.systemSecure).toBe(true);

    for (const attack of report.attackResults) {
      expect(attack.containedSuccessfully).toBe(true);
    }
  });
});
