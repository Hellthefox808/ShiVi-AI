export interface A2AMessage { from: string; to: string; type: string; payload: unknown; }
export class A2AService { send(msg: A2AMessage): { delivered: boolean } { return { delivered: true }; } }
