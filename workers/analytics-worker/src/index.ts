export interface AnalyticsJob { metric: string; aggregation: 'sum' | 'avg' | 'count'; period: string; }
export class AnalyticsWorker { async aggregate(job: AnalyticsJob): Promise<{ result: number }> { return { result: 0 }; } }
