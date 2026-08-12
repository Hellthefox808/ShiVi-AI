import { describe, it, expect } from 'vitest';
import { AIFinOpsDomainEngine } from '../index.js';
import { ModelCostTracker } from '@shivi/ai-sdk';

describe('ShiVi System 25: AI FinOps Domain Suite', () => {
  it('should generate audit report and track budget utilization', () => {
    ModelCostTracker.resetLedger();
    ModelCostTracker.recordUsage('tenant-finops-1', 'agent-01', 'gemini-1.5-pro', 10000, 2000);

    const report = AIFinOpsDomainEngine.generateTenantFinOpsReport('tenant-finops-1', 1.0);
    expect(report.tenantId).toBe('tenant-finops-1');
    expect(report.currentSpendUSD).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });
});
