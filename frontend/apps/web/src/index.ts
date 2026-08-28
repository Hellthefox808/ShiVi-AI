/**
 * ShiVi Web App
 */
export interface WebAppConfig {
  basePath: string;
  enableSSR?: boolean;
  enableStreaming?: boolean;
}

export class ShiViWebApp {
  constructor(private config: WebAppConfig) {}

  public getConfig(): WebAppConfig {
    return this.config;
  }
}
export default ShiViWebApp;
