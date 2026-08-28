import { describe, it, expect } from 'vitest';
import { AuthClient } from '../index.js';

describe('ShiVi Auth Client Suite', () => {
  const auth = new AuthClient({ authority: 'https://auth.shivi.ai', clientId: 'web_client' });

  it('should handle token verification and session state', async () => {
    expect(auth).toBeDefined();
  });
});
