export interface RevenueMetric { period: string; arr: number; mrr: number; churn: number; }
export class RevOpsService { getMetrics(tenantId: string): RevenueMetric[] { return []; } }
