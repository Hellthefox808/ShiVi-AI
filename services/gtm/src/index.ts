export interface Campaign { id: string; name: string; status: string; budget: number; }
export class GTMService { getCampaigns(tenantId: string): Campaign[] { return []; } }
