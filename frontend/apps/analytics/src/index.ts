/**
 * ShiVi Analytics Dashboard App
 */
export interface AnalyticsConfig {
  basePath: string;
  refreshIntervalMs?: number;
}

export class AnalyticsDashboard {
  constructor(private config: AnalyticsConfig) {}

  public getConfig(): AnalyticsConfig {
    return this.config;
  }
}
export default AnalyticsDashboard;
