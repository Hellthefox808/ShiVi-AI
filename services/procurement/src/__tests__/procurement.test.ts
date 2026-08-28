import { describe, it, expect } from 'vitest';
import { ProcurementService } from '../index.js';

describe('ProcurementService Enterprise Suite', () => {
  const service = new ProcurementService();

  it('should create purchase requisition', async () => {
    const po = await service.createPurchaseOrder({
      tenantId: 'tenant_proc',
      vendorId: 'vend_gpu_cloud',
      items: [{ item: 'H100 GPU Cluster', costUSD: 150000 }],
    });
    expect(po.poId).toBeDefined();
    expect(po.status).toBe('pending_approval');
  });

  it('should approve vendor onboarding and RFP', async () => {
    const res = await service.approveVendor('vend_gpu_cloud', 'approver_cfo');
    expect(res.approved).toBe(true);
  });
});
