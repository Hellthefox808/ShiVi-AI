export interface Lead { id: string; email: string; score: number; source: string; }
export class MarketingService { getLeads(tenantId: string): Lead[] { return []; } }
