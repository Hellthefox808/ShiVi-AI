/**
 * ShiVi Developer Portal App
 */
export interface DevPortalConfig {
  basePath: string;
  apiDocsEnabled?: boolean;
  sandboxEnabled?: boolean;
}

export class DeveloperPortalApp {
  constructor(private config: DevPortalConfig) {}

  public getConfig(): DevPortalConfig {
    return this.config;
  }
}
export default DeveloperPortalApp;
