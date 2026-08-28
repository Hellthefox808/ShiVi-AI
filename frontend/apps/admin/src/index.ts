/**
 * ShiVi Admin Dashboard App
 */
export interface AdminConfig {
  basePath: string;
  superAdminOnly?: boolean;
}

export class AdminApp {
  constructor(private config: AdminConfig) {}

  public getConfig(): AdminConfig {
    return this.config;
  }
}
export default AdminApp;
