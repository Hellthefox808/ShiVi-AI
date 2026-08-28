export interface AuthSession { userId: string; tenantId: string; roles: string[]; expiresAt: string; accessToken: string; }
export interface LoginCredentials { email: string; password: string; mfaCode?: string; }
export interface SSOConfig { provider: 'google' | 'microsoft' | 'okta' | 'saml'; clientId: string; redirectUri: string; }

export class AuthClient {
  private session: AuthSession | null = null;

  constructor(private config: { authority: string; clientId: string }) {}

  async login(creds: LoginCredentials): Promise<AuthSession> {
    this.session = {
      userId: 'usr_auth_123',
      tenantId: 'tenant_default',
      roles: ['admin', 'operator'],
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      accessToken: 'jwt_mock_token_' + Date.now(),
    };
    return this.session;
  }

  async logout(): Promise<void> {
    this.session = null;
  }

  async refreshToken(): Promise<AuthSession> {
    if (!this.session) {
      return this.login({ email: 'default@shivi.ai', password: 'password123' });
    }
    this.session.accessToken = 'jwt_refreshed_token_' + Date.now();
    return this.session;
  }

  getSession(): AuthSession | null {
    return this.session;
  }
}
