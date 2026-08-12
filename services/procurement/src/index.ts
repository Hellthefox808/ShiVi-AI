export interface PurchaseOrder { id: string; vendor: string; amount: number; status: string; }
export class ProcurementService { getPOs(tenantId: string): PurchaseOrder[] { return []; } }
