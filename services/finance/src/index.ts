export interface Invoice { id: string; amount: number; currency: string; status: string; }
export class FinanceService { getInvoices(tenantId: string): Invoice[] { return []; } }
