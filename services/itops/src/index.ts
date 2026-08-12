export interface Incident { id: string; title: string; severity: string; status: string; }
export class ITOpsService { getIncidents(tenantId: string): Incident[] { return []; } }
