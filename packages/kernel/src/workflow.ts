/**
 * ShiVi X100+ Kernel — Event-Driven Durable Workflow Primitives
 * Standard: SAD v2.0 §12, TDA v1.1 §12, FTL-KER-006
 */

export type WorkflowStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'COMPENSATED' | 'TIMED_OUT' | 'CANCELLED';

export interface WorkflowStep {
  stepId: string;
  name: string;
  action: (input: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown>;
  compensation?: (input: Record<string, unknown>) => Promise<void> | void;
  maxRetries?: number;
  timeoutMs?: number;
}

export interface WorkflowStateCheckpoint {
  checkpointId: string;
  stepId: string;
  status: WorkflowStatus;
  output?: Record<string, unknown>;
  error?: string;
  timestamp: number;
}

export interface WorkflowExecutionInstance {
  workflowId: string;
  tenantId: string;
  definitionName: string;
  status: WorkflowStatus;
  currentStepIndex: number;
  idempotencyKey: string;
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  checkpoints: WorkflowStateCheckpoint[];
  createdAt: number;
  updatedAt: number;
}

export class WorkflowEngine {
  private static activeInstances = new Map<string, WorkflowExecutionInstance>();
  private static idempotencyMap = new Map<string, string>(); // idempotencyKey -> workflowId

  /**
   * Execute a durable multi-step workflow with state checkpointing and compensation support
   */
  public static async executeWorkflow(
    tenantId: string,
    definitionName: string,
    idempotencyKey: string,
    steps: WorkflowStep[],
    input: Record<string, unknown>
  ): Promise<WorkflowExecutionInstance> {
    if (!tenantId || !definitionName || !idempotencyKey) {
      throw new Error('Workflow execution failed: tenantId, definitionName, and idempotencyKey are required.');
    }

    // Idempotency check
    const existingWorkflowId = this.idempotencyMap.get(`tenant:${tenantId}:${idempotencyKey}`);
    if (existingWorkflowId) {
      const existingInstance = this.activeInstances.get(existingWorkflowId);
      if (existingInstance) {
        return existingInstance;
      }
    }

    const now = Date.now();
    const workflowId = `wf_${definitionName}_${Math.random().toString(36).substring(2, 11)}_${now}`;

    const instance: WorkflowExecutionInstance = {
      workflowId,
      tenantId,
      definitionName,
      status: 'RUNNING',
      currentStepIndex: 0,
      idempotencyKey,
      input,
      checkpoints: [],
      createdAt: now,
      updatedAt: now,
    };

    this.activeInstances.set(workflowId, instance);
    this.idempotencyMap.set(`tenant:${tenantId}:${idempotencyKey}`, workflowId);

    let currentInput = { ...input };

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      instance.currentStepIndex = i;
      let stepSuccess = false;
      let retries = 0;
      const maxRetries = step.maxRetries ?? 2;
      let lastStepError: Error | undefined;

      while (!stepSuccess && retries <= maxRetries) {
        try {
          const stepOutput = await step.action(currentInput);
          currentInput = { ...currentInput, ...stepOutput };
          stepSuccess = true;

          instance.checkpoints.push({
            checkpointId: `chk_${step.stepId}_${Date.now()}`,
            stepId: step.stepId,
            status: 'COMPLETED',
            output: stepOutput,
            timestamp: Date.now(),
          });
        } catch (err: any) {
          retries++;
          lastStepError = err;

          instance.checkpoints.push({
            checkpointId: `chk_err_${step.stepId}_${Date.now()}`,
            stepId: step.stepId,
            status: 'FAILED',
            error: err?.message ?? 'Step execution failed',
            timestamp: Date.now(),
          });
        }
      }

      if (!stepSuccess) {
        // Workflow failure: Trigger compensation sequence for completed steps in reverse order
        instance.status = 'FAILED';
        instance.error = `Workflow failed at step '${step.stepId}': ${lastStepError?.message}`;
        instance.updatedAt = Date.now();

        await this.rollbackWorkflow(instance, steps, i - 1, currentInput);
        return instance;
      }
    }

    instance.status = 'COMPLETED';
    instance.output = currentInput;
    instance.updatedAt = Date.now();
    return instance;
  }

  /**
   * Compensation rollback runner for failed workflows
   */
  private static async rollbackWorkflow(
    instance: WorkflowExecutionInstance,
    steps: WorkflowStep[],
    fromStepIndex: number,
    context: Record<string, unknown>
  ): Promise<void> {
    for (let i = fromStepIndex; i >= 0; i--) {
      const step = steps[i];
      if (step.compensation) {
        try {
          await step.compensation(context);
          instance.checkpoints.push({
            checkpointId: `chk_comp_${step.stepId}_${Date.now()}`,
            stepId: step.stepId,
            status: 'COMPENSATED',
            timestamp: Date.now(),
          });
        } catch (compErr: any) {
          instance.checkpoints.push({
            checkpointId: `chk_comp_err_${step.stepId}_${Date.now()}`,
            stepId: step.stepId,
            status: 'FAILED',
            error: `Compensation failed: ${compErr?.message}`,
            timestamp: Date.now(),
          });
        }
      }
    }
    instance.status = 'COMPENSATED';
  }

  /**
   * Get workflow instance by ID with tenant isolation check
   */
  public static getWorkflowInstance(requestTenantId: string, workflowId: string): WorkflowExecutionInstance | undefined {
    const instance = this.activeInstances.get(workflowId);
    if (!instance) return undefined;

    if (instance.tenantId !== requestTenantId) {
      throw new Error(`Cross-tenant workflow violation: Tenant '${requestTenantId}' cannot view workflow '${workflowId}'`);
    }

    return instance;
  }

  /**
   * Reset store (testing only)
   */
  public static resetStore(): void {
    this.activeInstances.clear();
    this.idempotencyMap.clear();
  }
}
