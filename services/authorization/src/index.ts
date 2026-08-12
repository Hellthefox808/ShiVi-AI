export interface AuthzDecision { allowed: boolean; reason: string; }
export class AuthorizationService { evaluate(subject: string, action: string, resource: string): AuthzDecision { return { allowed: true, reason: 'allowed' }; } }
