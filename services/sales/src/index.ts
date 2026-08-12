export interface Deal { id: string; name: string; stage: string; value: number; probability: number; }
export class SalesService { getDeals(tenantId: string): Deal[] { return []; } }
