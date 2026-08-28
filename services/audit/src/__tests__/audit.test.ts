import { describe, it, expect } from 'vitest';
import { AuditService } from '../index.js';

describe('AuditService Security Suite', () => {
  const service = new AuditService();

  it('should append audit log record with SHA-256 evidence proof', async () => {
    const log = await service.logAction({
      tenantId: 'tenant_audit',
      actorId: 'usr_admin',
      action: 'policy:update',
      resourceId: 'pol_101',
      details: { change: 'Enabled MFA' },
    });
    expect(log.entryHash).toBeDefined();
    expect(log.timestamp).toBeInstanceOf(Date);
  });

  it('should verify audit ledger chain tamper integrity', async () => {
    const verification = await service.verifyAuditChain('tenant_audit');
    expect(verification.isValid).toBe(true);
    expect(verification.verifiedRecordsCount).toBeGreaterThan(0);
  });
});
