/**
 * ShiVi X100+ Contracts — Agent Execution & Trajectory Contract
 * Standard: SAD v2.0 §31, TDA v1.1 §140
 */

import { z } from 'zod';

export const AgentStateSchema = z.enum([
  'INITIALIZING',
  'EVALUATING',
  'SECURITY_REVIEW',
  'STAGING',
  'CANARY',
  'ACTIVE',
  'DEGRADED',
  'QUARANTINED',
  'REVOKED',
  'RETIRED',
]);

export type AgentStateContract = z.infer<typeof AgentStateSchema>;

export const ToolExecutionContractSchema = z.object({
  toolCallId: z.string(),
  toolName: z.string(),
  parameters: z.record(z.string(), z.unknown()),
  status: z.enum(['PENDING', 'EXECUTING', 'COMPLETED', 'FAILED']),
  result: z.unknown().optional(),
  executionTimeMs: z.number().optional(),
});

export type ToolExecutionContract = z.infer<typeof ToolExecutionContractSchema>;

export const AgentTrajectoryStepSchema = z.object({
  stepIndex: z.number(),
  timestamp: z.number(),
  thoughtStatus: z.string(), // Safe, high-level status (non-sensitive)
  toolCalls: z.array(ToolExecutionContractSchema),
  confidenceScore: z.number(), // 0.0 to 1.0
  evidenceRecordId: z.string().optional(),
});

export type AgentTrajectoryStep = z.infer<typeof AgentTrajectoryStepSchema>;

export const AgentSessionContractSchema = z.object({
  sessionId: z.string(),
  tenantId: z.string(),
  agentId: z.string(),
  agentVersion: z.string(),
  state: AgentStateSchema,
  riskLevel: z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5']),
  trajectory: z.array(AgentTrajectoryStepSchema),
  startedAt: z.number(),
  completedAt: z.number().optional(),
});

export type AgentSessionContract = z.infer<typeof AgentSessionContractSchema>;
