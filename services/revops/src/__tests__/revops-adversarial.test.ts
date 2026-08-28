import { describe, it, expect } from 'vitest';
import { RevOpsService } from '../index.js';

describe('RevOps Domain Adversarial & Stress Testing Suite (Challenger 2)', () => {
  const revopsService = new RevOpsService();

  describe('1. RevOps Deal Risk & Pipeline Boundary Conditions & Arithmetic', () => {
    it('should test stage stagnation boundary condition at 20, 21, 22, and 34 days', async () => {
      // Base condition: hasEconomicBuyer=true, lastContactDaysAgo=0
      // Boundary 20: not stalled, score = 10 (base), riskLevel = LOW
      const res20 = await revopsService.assessDealRisk('deal-20', 20, true, 0);
      expect(res20.isStalled).toBe(false);
      expect(res20.riskScore).toBe(10);
      expect(res20.riskLevel).toBe('LOW');
      expect(res20.riskFactors.find(f => f.factorCode === 'STAGE_STAGNATION')).toBeUndefined();

      // Boundary 21: not stalled (threshold is strictly > 21)
      const res21 = await revopsService.assessDealRisk('deal-21', 21, true, 0);
      expect(res21.isStalled).toBe(false);
      expect(res21.riskScore).toBe(10);
      expect(res21.riskLevel).toBe('LOW');
      expect(res21.riskFactors.find(f => f.factorCode === 'STAGE_STAGNATION')).toBeUndefined();

      // Boundary 22: stalled (22 > 21), score = 10 + 40 = 50, riskLevel = HIGH
      const res22 = await revopsService.assessDealRisk('deal-22', 22, true, 0);
      expect(res22.isStalled).toBe(true);
      expect(res22.riskScore).toBe(50);
      expect(res22.riskLevel).toBe('HIGH');
      expect(res22.riskFactors.find(f => f.factorCode === 'STAGE_STAGNATION')).toBeDefined();
      expect(res22.riskFactors.find(f => f.factorCode === 'STAGE_STAGNATION')?.impact).toBe(40);

      // Boundary 34 (Acme Corp scenario): stalled, score = 50, riskLevel = HIGH
      const res34 = await revopsService.assessDealRisk('deal-34', 34, true, 0);
      expect(res34.isStalled).toBe(true);
      expect(res34.stalledDays).toBe(34);
      expect(res34.riskScore).toBe(50);
    });

    it('should test communication gap boundary condition at 13, 14, 15, and 24 days', async () => {
      // Boundary 13: no communication gap
      const res13 = await revopsService.assessDealRisk('deal-c13', 10, true, 13);
      expect(res13.riskScore).toBe(10);
      expect(res13.riskFactors.find(f => f.factorCode === 'COMMUNICATION_GAP')).toBeUndefined();

      // Boundary 14: no communication gap (threshold is strictly > 14)
      const res14 = await revopsService.assessDealRisk('deal-c14', 10, true, 14);
      expect(res14.riskScore).toBe(10);
      expect(res14.riskFactors.find(f => f.factorCode === 'COMMUNICATION_GAP')).toBeUndefined();

      // Boundary 15: communication gap triggered (+15 impact) -> score = 25, LOW
      const res15 = await revopsService.assessDealRisk('deal-c15', 10, true, 15);
      expect(res15.riskScore).toBe(25);
      expect(res15.riskLevel).toBe('LOW');
      expect(res15.riskFactors.find(f => f.factorCode === 'COMMUNICATION_GAP')).toBeDefined();
      expect(res15.riskFactors.find(f => f.factorCode === 'COMMUNICATION_GAP')?.impact).toBe(15);

      // Boundary 24: communication gap triggered
      const res24 = await revopsService.assessDealRisk('deal-c24', 10, true, 24);
      expect(res24.riskScore).toBe(25);
      expect(res24.riskFactors.find(f => f.factorCode === 'COMMUNICATION_GAP')?.impact).toBe(15);
    });

    it('should test buying committee stakeholder gap and combined risk scoring', async () => {
      // Missing Economic Buyer (+30) -> score = 10 + 30 = 40, MEDIUM
      const resBuyer = await revopsService.assessDealRisk('deal-buyer', 10, false, 0);
      expect(resBuyer.riskScore).toBe(40);
      expect(resBuyer.riskLevel).toBe('MEDIUM');
      expect(resBuyer.missingStakeholders).toContain('ECONOMIC_BUYER');
      expect(resBuyer.riskFactors.find(f => f.factorCode === 'MISSING_ECONOMIC_BUYER')?.impact).toBe(30);

      // Full Critical Risk: daysInStage=34 (+40) + hasEconomicBuyer=false (+30) + lastContactDaysAgo=24 (+15)
      // Score = 10 + 40 + 30 + 15 = 95 -> CRITICAL (>= 70)
      const resCrit = await revopsService.assessDealRisk('deal-acme-expansion', 34, false, 24);
      expect(resCrit.riskScore).toBe(95);
      expect(resCrit.riskLevel).toBe('CRITICAL');
      expect(resCrit.isStalled).toBe(true);
      expect(resCrit.missingStakeholders).toContain('ECONOMIC_BUYER');
      expect(resCrit.riskFactors.length).toBe(3);
      expect(resCrit.nextBestAction).toContain('Trigger Executive Sponsor outreach to Economic Buyer with SOC2 compliance pack');

      // Clamping test: Score cannot exceed 100
      expect(resCrit.riskScore).toBeLessThanOrEqual(100);
      expect(resCrit.riskScore).toBeGreaterThanOrEqual(0);
    });

    it('should verify dynamic forecast rollup arithmetic and stage metrics', async () => {
      const velocity = await revopsService.analyzePipelineVelocity('tenant-adversarial-test');

      expect(velocity.tenantId).toBe('tenant-adversarial-test');
      expect(velocity.velocityUSDPerDay).toBe(42500);
      expect(velocity.winRatePct).toBe(34.2);
      expect(velocity.avgDealSizeUSD).toBe(78000);
      expect(velocity.averageSalesCycleDays).toBe(45);
      expect(velocity.committedForecastUSD).toBe(1540000);

      // Stage metrics summation check
      const totalStageValue = velocity.stages.reduce((sum, s) => sum + s.totalValueUSD, 0);
      const totalWeightedValue = velocity.stages.reduce((sum, s) => sum + s.weightedValueUSD, 0);

      expect(velocity.totalPipelineUSD).toBe(totalStageValue);
      expect(velocity.weightedPipelineUSD).toBe(totalWeightedValue);
      expect(velocity.stages.length).toBe(4);

      // Check stages distribution
      const qual = velocity.stages.find(s => s.stage === 'QUALIFICATION');
      expect(qual?.count).toBe(4);
      expect(qual?.totalValueUSD).toBe(240000);
      expect(qual?.weightedValueUSD).toBe(48000);

      const prop = velocity.stages.find(s => s.stage === 'PROPOSAL_PRICE_QUOTE');
      expect(prop?.stalledDealsCount).toBe(1);
    });

    it('should handle zero, negative, and extreme inputs safely in assessDealRisk', async () => {
      // Negative days in stage
      const resNeg = await revopsService.assessDealRisk('deal-neg', -10, true, -5);
      expect(resNeg.riskScore).toBe(10);
      expect(resNeg.isStalled).toBe(false);
      expect(resNeg.riskLevel).toBe('LOW');

      // Extreme large days in stage (9999) + missing buyer + long contact gap
      const resExtreme = await revopsService.assessDealRisk('deal-ext', 9999, false, 9999);
      expect(resExtreme.riskScore).toBe(95); // 10 + 40 + 30 + 15 = 95
      expect(resExtreme.riskScore).toBeLessThanOrEqual(100);
      expect(resExtreme.riskLevel).toBe('CRITICAL');
      expect(resExtreme.isStalled).toBe(true);
    });

    it('should handle CAC and LTV computations with positive return values', async () => {
      const cac = await revopsService.getCACAndLTV('tenant-any');
      expect(cac.cacUSD).toBe(14500);
      expect(cac.ltvUSD).toBe(87000);
      expect(cac.ltvCacRatio).toBe(6.0);
      expect(cac.paybackPeriodMonths).toBe(8.5);
    });
  });
});
