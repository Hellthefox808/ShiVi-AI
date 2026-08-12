export interface PolicyRule { id: string; effect: 'allow' | 'deny'; conditions: Record<string, unknown>; }
export class PolicyService { evaluatePolicy(rules: PolicyRule[]): boolean { return true; } }
