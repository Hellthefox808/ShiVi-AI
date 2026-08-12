export interface ObservabilityConfig { otelEndpoint: string; samplingRate: number; }
export class ObservabilityService { constructor(private config: ObservabilityConfig) {} }
