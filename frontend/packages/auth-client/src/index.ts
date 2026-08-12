export interface AuthSession { userId: string; tenantId: string; roles: string[]; expiresAt: string; accessToken: string; }
export interface LoginCredentials { email: string; password: string; mfaCode?: string; }
export interface SSOConfig { provider: 'google' | 'microsoft' | 'okta' | 'saml'; clientId: string; redirectUri: string; }
export class ShiViAuthClient { constructor(private baseUrl: string) {}
  async login(creds: LoginCredentials): Promise<AuthSession> { return {} as AuthSession; }
  async logout(): Promise<void> {}
  async refreshToken(): Promise<AuthSession> { return {} as AuthSession; }
}
