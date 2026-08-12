export interface TenantProvisionRequest { tenantId: string; plan: string; region: string; }
export class TenancyService { provisionTenant(req: TenantProvisionRequest): { success: boolean } { return { success: true }; } }
