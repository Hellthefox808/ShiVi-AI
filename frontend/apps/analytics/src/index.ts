export interface AnalyticsConfig { readonly basePath: string; readonly refreshIntervalMs: number; }
export class AnalyticsDashboard { constructor(private config: AnalyticsConfig) {} }
