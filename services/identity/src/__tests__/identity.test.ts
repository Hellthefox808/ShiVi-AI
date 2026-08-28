import { describe, it, expect } from 'vitest';
import { IdentityService } from '../index.js';

describe('IdentityService Platform Suite', () => {
  const service = new IdentityService();

  it('should validate SPIFFE SVID token correctly', async () => {
    const res = await service.validateSVID('spiffe_test_token_123');
    expect(res.spiffeId).toContain('spiffe://');
    expect(res.trustDomain).toBe('shivi.internal');
    expect(res.expiresAt).toBeInstanceOf(Date);
  });

  it('should authenticate user via SSO provider', async () => {
    const session = await service.authenticateSSO('sso_google', 'credential_jwt_abc');
    expect(session.sessionId).toBeDefined();
    expect(session.providerId).toBe('sso_google');
    expect(session.roles).toContain('user');
  });

  it('should retrieve active identity session by ID', async () => {
    const session = await service.getSession('sess_123');
    expect(session).not.toBeNull();
    expect(session?.sessionId).toBe('sess_123');
    expect(session?.roles).toContain('admin');
  });
});
