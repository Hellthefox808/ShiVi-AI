import { describe, it, expect } from 'vitest';
import { SalesService } from '../index.js';

describe('SalesService Enterprise Suite', () => {
  const service = new SalesService();

  it('should calculate lead score based on signals', async () => {
    const score = await service.calculateLeadScore({
      companySize: 500,
      industry: 'FinTech',
      pageViewsLast7Days: 14,
      requestedDemo: true,
    });
    expect(score.score).toBeGreaterThan(70);
    expect(score.grade).toBe('A');
  });

  it('should forecast quarterly revenue quota', async () => {
    const forecast = await service.getRevenueForecast('tenant_sales', '2026-Q3');
    expect(forecast.projectedRevenueUSD).toBeGreaterThan(1000000);
    expect(forecast.confidence).toBeGreaterThan(0.8);
  });
});
