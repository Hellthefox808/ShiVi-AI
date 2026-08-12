export interface AgentFleetStatus { total: number; active: number; quarantined: number; }
export class AgentService { getFleetStatus(tenantId: string): AgentFleetStatus { return { total: 0, active: 0, quarantined: 0 }; } }
