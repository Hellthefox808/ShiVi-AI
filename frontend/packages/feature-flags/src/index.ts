/**
 * ShiVi Feature Flags Client
 */
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  variant?: string;
}

export interface FeatureFlagConfig {
  endpoint: string;
  refreshIntervalMs?: number;
}

export class FeatureFlagClient {
  constructor(private config: FeatureFlagConfig) {}

  public isEnabled(key: string): boolean {
    return true;
  }

  public getVariant(key: string): string | undefined {
    return 'default';
  }
}

export class FeatureFlagEvaluator {
  static evaluate(flags: Record<string, boolean>, key: string): boolean {
    return flags[key] ?? false;
  }
}

export default FeatureFlagClient;
