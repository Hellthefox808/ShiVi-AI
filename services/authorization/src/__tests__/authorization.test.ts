import { describe, it, expect } from 'vitest';
import { AuthorizationService } from '../index.js';

describe('AuthorizationService Platform Suite', () => {
  const service = new AuthorizationService();

  it('should evaluate policy for authorization requests', async () => {
    const decision = await service.evaluatePolicy({
      subject: 'usr_alice',
      action: 'read',
      resource: 'document_123',
      tenantId: 'tenant_default',
    });
    expect(decision.allowed).toBe(true);
    expect(decision.evaluatedAt).toBeInstanceOf(Date);
  });

  it('should check permissions against relationship graph', async () => {
    const allowed = await service.checkPermission('usr_alice', 'owner', 'folder_456');
    expect(allowed).toBe(true);
  });

  it('should write OpenFGA relationship tuples without error', async () => {
    await expect(service.writeTuples([
      { user: 'usr_bob', relation: 'editor', object: 'doc_789' }
    ])).resolves.not.toThrow();
  });
});
