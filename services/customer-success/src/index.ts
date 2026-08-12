export interface CustomerHealth { customerId: string; score: number; risk: 'low' | 'medium' | 'high'; }
export class CustomerSuccessService { getHealth(tenantId: string): CustomerHealth[] { return []; } }
