import { describe, it, expect } from 'vitest';
import { WorkflowService } from '../index.js';

describe('WorkflowService Orchestration Suite', () => {
  const service = new WorkflowService();

  it('should start a workflow and return execution handle', async () => {
    const execution = await service.startWorkflow({
      name: 'Customer Onboarding',
      taskQueue: 'onboarding-queue',
      input: { customerId: 'cust_99' },
    });
    expect(execution.workflowId).toBeDefined();
    expect(execution.status).toBe('running');
  });

  it('should signal a running workflow', async () => {
    await expect(service.signalWorkflow('wf_123', 'approve_step', { approved: true })).resolves.not.toThrow();
  });

  it('should retrieve workflow execution state', async () => {
    const state = await service.getWorkflowState('wf_123');
    expect(state).not.toBeNull();
    expect(state?.status).toBe('completed');
    expect(state?.steps.length).toBeGreaterThanOrEqual(3);
  });

  it('should handle workflow rollback compensation cleanly', async () => {
    const rolledBack = await service.signalWorkflow('wf_123', 'rollback');
    expect(rolledBack.status).toBe('completed');
  });

  it('should list active executions for a tenant', async () => {
    await service.startWorkflow({
      name: 'Deal Acceleration',
      tenantId: 'tenant_gamma',
      taskQueue: 'revops-queue',
      input: { oppId: 'opp_100k' },
    });
    const list = await service.listExecutions('tenant_gamma');
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].name).toBe('Deal Acceleration');
  });
});

