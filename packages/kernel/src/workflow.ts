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

    const { RedisClientAdapter } = await import('@shivi/database');
    const idemKey = `tenant:${tenantId}:${idempotencyKey}`;

    // Idempotency check
    const existingWorkflowId = await RedisClientAdapter.get(tenantId, idemKey);
    if (existingWorkflowId) {
      const existingInstanceStr = await RedisClientAdapter.get(tenantId, existingWorkflowId);
      if (existingInstanceStr) {
        return JSON.parse(existingInstanceStr);
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

    await RedisClientAdapter.set(tenantId, workflowId, JSON.stringify(instance));
    await RedisClientAdapter.set(tenantId, idemKey, workflowId);

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

      await RedisClientAdapter.set(tenantId, workflowId, JSON.stringify(instance));

      if (!stepSuccess) {
        // Workflow failure: Trigger compensation sequence for completed steps in reverse order
        instance.status = 'FAILED';
        instance.error = `Workflow failed at step '${step.stepId}': ${lastStepError?.message}`;
        instance.updatedAt = Date.now();
        await RedisClientAdapter.set(tenantId, workflowId, JSON.stringify(instance));

        await this.rollbackWorkflow(instance, steps, i - 1, currentInput);
        return instance;
      }
    }

    instance.status = 'COMPLETED';
    instance.output = currentInput;
    instance.updatedAt = Date.now();
    await RedisClientAdapter.set(tenantId, workflowId, JSON.stringify(instance));
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
    const { RedisClientAdapter } = await import('@shivi/database');
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
    await RedisClientAdapter.set(instance.tenantId, instance.workflowId, JSON.stringify(instance));
  }

  /**
   * Get workflow instance by ID with tenant isolation check
   */
  public static async getWorkflowInstance(requestTenantId: string, workflowId: string): Promise<WorkflowExecutionInstance | undefined> {
    const { RedisClientAdapter } = await import('@shivi/database');
    const instanceStr = await RedisClientAdapter.get(requestTenantId, workflowId);
    if (!instanceStr) return undefined;

    const instance: WorkflowExecutionInstance = JSON.parse(instanceStr);
    if (instance.tenantId !== requestTenantId) {
      throw new Error(`Cross-tenant workflow violation: Tenant '${requestTenantId}' cannot view workflow '${workflowId}'`);
    }

    return instance;
  }

  /**
   * Reset store (testing only)
   */
  public static resetStore(): void {
    // Requires Redis keyspace flush which is handled in DB adapter for tests.
  }
}
