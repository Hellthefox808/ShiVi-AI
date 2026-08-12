export interface Contact { id: string; name: string; email: string; company: string; }
export class CRMService { getContacts(tenantId: string): Contact[] { return []; } }
