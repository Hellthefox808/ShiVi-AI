export interface UsageRecord { tenantId: string; metric: string; quantity: number; timestamp: string; }
export class BillingService { recordUsage(record: UsageRecord): void {} }
