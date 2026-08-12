export interface FeatureFlag { key: string; enabled: boolean; variant?: string; }
export interface FeatureFlagConfig { endpoint: string; refreshIntervalMs: number; }
export class FeatureFlagClient { constructor(private config: FeatureFlagConfig) {}
  isEnabled(key: string): boolean { return false; }
  getVariant(key: string): string | undefined { return undefined; }
}
