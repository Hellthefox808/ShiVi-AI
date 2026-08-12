export interface AuditEntry { action: string; actor: string; resource: string; timestamp: string; }
export class AuditService { log(entry: AuditEntry): void {} }
