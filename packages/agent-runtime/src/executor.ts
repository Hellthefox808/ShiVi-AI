/**
 * ShiVi X100+ Agent Runtime — Governed Execution Engine
 * Standard: SAD v2.0 §15-17, TDA v1.1 §42
 */

import { TenancyContext, CapabilityBroker, CapabilityViolationError } from '@shivi/kernel';
import { PromptSanitizer, EvidenceLedger } from '@shivi/security';
import { ModelRouter, ModelCostTracker } from '@shivi/ai-sdk';
import { AgentLifecycleManager, AgentManifest } from './lifecycle.js';

export interface AgentExecutionTask {
  taskId: string;
  tenantId: string;
  agentId: string;
  agentVersion: string;
  inputPrompt: string;
  capabilityTokenId: string;
  humanApprovalGranted?: boolean;
  maxCostUSD?: number;
}

export interface TrajectoryStep {
  stepIndex: number;
  thought: string;
  toolCall?: {
    toolName: string;
    arguments: Record<string, unknown>;
  };
  observation: string;
  timestamp: number;
}

export interface AgentExecutionResult {
  taskId: string;
  tenantId: string;
  agentId: string;
  status: 'COMPLETED' | 'QUARANTINED' | 'FAILED' | 'ABORTED_COST_EXCEEDED' | 'ABORTED_LOOP_DETECTED';
  finalOutput: string;
  trajectory: TrajectoryStep[];
  evidenceRecordId: string;
  totalCostUSD: number;
  executedAt: number;
}

export class AgentExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AgentExecutionError';
  }
}

export class AgentExecutor {
  /**
   * Execute an agent task through the complete governed lifecycle pipeline
   */
  public static async executeTask(
    tenancyContext: TenancyContext,
    task: AgentExecutionTask
  ): Promise<AgentExecutionResult> {
    const now = Date.now();

    // 1. Admission & Lifecycle Check
    const agent = AgentLifecycleManager.getAgent(task.tenantId, task.agentId, task.agentVersion);
    if (!agent) {
      throw new AgentExecutionError(`Execution rejected: Agent '${task.agentId}' not registered for tenant '${task.tenantId}'.`);
    }

    if (agent.state !== 'ACTIVE' && agent.state !== 'CANARY' && agent.state !== 'STAGING') {
      throw new AgentExecutionError(`Execution rejected: Agent '${task.agentId}' is in state '${agent.state}' (must be ACTIVE, CANARY, or STAGING).`);
    }

    // 2. Prompt Security Scan (Indirect & Direct Prompt Injection)
    const securityCheck = PromptSanitizer.scanInput(task.inputPrompt);
    if (!securityCheck.safe) {
      AgentLifecycleManager.transitionState(task.tenantId, task.agentId, task.agentVersion, 'QUARANTINED', securityCheck.threatDetected);
      throw new AgentExecutionError(`Execution halted: Adversarial prompt injection detected (${securityCheck.threatDetected}). Agent '${task.agentId}' has been QUARANTINED.`);
    }

    // 3. Capability & T0-T5 Risk Tier Validation
    CapabilityBroker.validateCapabilityExecution(task.capabilityTokenId, '*', task.humanApprovalGranted);

    // 4. Model Gateway Routing
    const route = ModelRouter.selectRoute({
      tenantId: task.tenantId,
      agentId: task.agentId,
      taskComplexity: 'MEDIUM',
    });

    // 5. Governed Trajectory Execution Loop with Loop Detection & Cost Ceiling Protection
    const trajectory: TrajectoryStep[] = [];
    const maxSteps = agent.maxTrajectorySteps ?? 10;
    let accumulatedCost = 0;
    const maxAllowedCost = task.maxCostUSD ?? 1.0;

    const seenToolCalls = new Map<string, number>();

    for (let stepIdx = 1; stepIdx <= maxSteps; stepIdx++) {
      // Token usage calculation & cost accumulator
      const stepPromptTokens = 250;
      const stepCompletionTokens = 150;
      const stepCost = ModelCostTracker.calculateCost(route.primaryModel, stepPromptTokens, stepCompletionTokens);
      accumulatedCost += stepCost;

      // FinOps cost explosion check
      if (accumulatedCost > maxAllowedCost) {
        const evidence = EvidenceLedger.appendEvidence(
          task.tenantId,
          `agent:${task.agentId}`,
          'AGENT_TASK_ABORTED',
          agent.maxRiskLevel,
          { taskId: task.taskId, reason: 'COST_EXCEEDED', accumulatedCost }
        );

        return {
          taskId: task.taskId,
          tenantId: task.tenantId,
          agentId: task.agentId,
          status: 'ABORTED_COST_EXCEEDED',
          finalOutput: `Execution aborted: Accumulated cost ($${accumulatedCost.toFixed(4)}) exceeded limit ($${maxAllowedCost.toFixed(4)}).`,
          trajectory,
          evidenceRecordId: evidence.recordId,
          totalCostUSD: accumulatedCost,
          executedAt: Date.now(),
        };
      }

      // Simulated tool call for step
      const toolCallName = agent.allowedTools.length > 0 ? agent.allowedTools[0] : 'default_analyzer';
      const callSignature = `${toolCallName}:${JSON.stringify({ query: task.inputPrompt })}`;

      // Loop detection logic (detect duplicate tool call loops >= 3 times)
      const callCount = (seenToolCalls.get(callSignature) ?? 0) + 1;
      seenToolCalls.set(callSignature, callCount);

      if (callCount >= 3) {
        const evidence = EvidenceLedger.appendEvidence(
          task.tenantId,
          `agent:${task.agentId}`,
          'AGENT_TASK_ABORTED',
          agent.maxRiskLevel,
          { taskId: task.taskId, reason: 'LOOP_DETECTED', toolCallName }
        );

        return {
          taskId: task.taskId,
          tenantId: task.tenantId,
          agentId: task.agentId,
          status: 'ABORTED_LOOP_DETECTED',
          finalOutput: `Execution aborted: Agent reasoning loop detected on tool '${toolCallName}'.`,
          trajectory,
          evidenceRecordId: evidence.recordId,
          totalCostUSD: accumulatedCost,
          executedAt: Date.now(),
        };
      }

      trajectory.push({
        stepIndex: stepIdx,
        thought: `[Step ${stepIdx}] Processing query via model '${route.primaryModel}' and tool '${toolCallName}'.`,
        toolCall: {
          toolName: toolCallName,
          arguments: { query: task.inputPrompt },
        },
        observation: `Tool '${toolCallName}' executed successfully for step ${stepIdx}.`,
        timestamp: Date.now(),
      });

      // Break loop if complete (for standard 2-step single execution demo)
      if (stepIdx >= 2) break;
    }

    // Record FinOps usage
    ModelCostTracker.recordUsage(task.tenantId, task.agentId, route.primaryModel, 500, 300);

    const finalOutput = `Agent '${agent.name}' successfully completed task '${task.taskId}' for query: "${task.inputPrompt}"`;

    // 6. Cryptographic Evidence Ledger Recording
    const evidence = EvidenceLedger.appendEvidence(
      task.tenantId,
      `agent:${task.agentId}`,
      'AGENT_TASK_EXECUTION',
      agent.maxRiskLevel,
      {
        taskId: task.taskId,
        inputPrompt: task.inputPrompt,
        model: route.primaryModel,
        trajectoryStepsCount: trajectory.length,
        totalCostUSD: accumulatedCost,
      }
    );

    return {
      taskId: task.taskId,
      tenantId: task.tenantId,
      agentId: task.agentId,
      status: 'COMPLETED',
      finalOutput,
      trajectory,
      evidenceRecordId: evidence.recordId,
      totalCostUSD: accumulatedCost,
      executedAt: Date.now(),
    };
  }
}
