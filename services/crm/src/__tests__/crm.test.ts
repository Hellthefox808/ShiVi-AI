import { describe, it, expect } from 'vitest';
import { CRMService } from '../index.js';

describe('CRMService Enterprise Suite', () => {
  const service = new CRMService();

  it('should get contact details and enrich profile', async () => {
    const contact = await service.getContact('tenant_crm', 'cont_101');
    expect(contact).not.toBeNull();
    expect(contact?.email).toContain('@');
  });

  it('should sync and track sales deals', async () => {
    const deals = await service.listDeals('tenant_crm', { minStage: 'negotiation' });
    expect(deals.length).toBeGreaterThan(0);
    expect(deals[0].amountUSD).toBeGreaterThan(0);
  });
});
