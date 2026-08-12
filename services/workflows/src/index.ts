export interface WorkflowDef { id: string; name: string; steps: unknown[]; version: number; }
export class WorkflowService { execute(def: WorkflowDef): { executionId: string } { return { executionId: 'wf-001' }; } }
