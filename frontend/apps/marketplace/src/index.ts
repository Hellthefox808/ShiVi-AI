/**
 * ShiVi Marketplace App
 */
export interface MarketplaceConfig {
  basePath: string;
  reviewEnabled?: boolean;
}

export class MarketplaceApp {
  constructor(private config: MarketplaceConfig) {}

  public getConfig(): MarketplaceConfig {
    return this.config;
  }
}
export default MarketplaceApp;
