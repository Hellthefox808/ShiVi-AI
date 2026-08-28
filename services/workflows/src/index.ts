/**
 * service-workflows - Temporal workflow orchestration
 *
 * @packageDocumentation
 */

export type WorkflowStatus = 'running' | 'completed' | 'failed' | 'terminated' | 'timed_out';

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  taskQueue: string;
  input: Record<string, unknown>;
}

export interface WorkflowExecution {
  runId: string;
  workflowId: string;
  status: WorkflowStatus;
  startTime: Date;
  executionTimeMs?: number;
}

export class WorkflowService {
  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async startWorkflow(definition: Omit<WorkflowDefinition, 'workflowId'>): Promise<WorkflowExecution> {
    const workflowId = 'wf_' + Math.random().toString(36).substring(2, 9);
    return {
      workflowId,
      runId: 'run_' + Math.random().toString(36).substring(2, 9),
      status: 'running',
      startTime: new Date(),
    };
  }

  public async signalWorkflow(workflowId: string, signalName: string, payload: unknown): Promise<void> {}

  public async getWorkflowState(workflowId: string): Promise<WorkflowExecution | null> {
    return {
      workflowId,
      runId: 'run_stub_123',
      status: 'completed',
      startTime: new Date(Date.now() - 60000),
      executionTimeMs: 1250,
    };
  }
}

export default WorkflowService;
