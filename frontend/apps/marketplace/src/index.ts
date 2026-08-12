export interface MarketplaceConfig { readonly basePath: string; readonly reviewEnabled: boolean; }
export class MarketplaceApp { constructor(private config: MarketplaceConfig) {} }
