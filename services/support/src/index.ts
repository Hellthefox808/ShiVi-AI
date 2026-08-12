export interface Ticket { id: string; subject: string; priority: string; status: string; }
export class SupportService { getTickets(tenantId: string): Ticket[] { return []; } }
