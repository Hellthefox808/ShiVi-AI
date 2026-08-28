import { describe, it, expect } from 'vitest';
import { SupportService } from '../index.js';

describe('SupportService Enterprise Suite', () => {
  const service = new SupportService();

  it('should create and auto-triage customer support ticket', async () => {
    const ticket = await service.createTicket({
      tenantId: 'tenant_supp',
      requesterEmail: 'user@acme.com',
      subject: 'SSO Login Failure',
      body: 'Getting invalid SAML assertion error on login',
      priority: 'high',
    });
    expect(ticket.ticketId).toBeDefined();
    expect(ticket.assignedTeam).toBe('Identity & Security');
  });

  it('should resolve ticket with solution summary', async () => {
    const resolved = await service.resolveTicket('tkt_123', 'Updated IdP certificate metadata');
    expect(resolved.status).toBe('resolved');
  });
});
