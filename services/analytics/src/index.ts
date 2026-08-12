export interface AnalyticsQuery { metric: string; dimensions: string[]; timeRange: { start: string; end: string }; }
export class AnalyticsService { query(q: AnalyticsQuery): { data: unknown[] } { return { data: [] }; } }
