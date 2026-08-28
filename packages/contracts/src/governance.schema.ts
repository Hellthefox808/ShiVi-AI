import { z } from 'zod';
import { RiskLevelSchema, AgentStateSchema } from './agent.schema.js';

export const ApprovalStatusSchema = z.enum([
  'PENDING',
  'GRANTED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
]);

export const ApprovalRequestSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  taskId: z.string().min(1),
  actionType: z.string().min(1),
  riskLevel: RiskLevelSchema,
  summary: z.string(),
  proposedPayload: z.record(z.string(), z.unknown()),
  status: ApprovalStatusSchema,
  requestedAt: z.number(),
  decidedAt: z.number().optional(),
  decidedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
});

export const EvaluationMetricSchema = z.object({
  taskSuccessRate: z.number().min(0).max(100),
  goalCompletionRate: z.number().min(0).max(100),
  groundednessScore: z.number().min(0).max(100),
  citationAccuracy: z.number().min(0).max(100),
  toolSuccessRate: z.number().min(0).max(100),
  policyComplianceScore: z.number().min(0).max(100),
  hallucinationRate: z.number().min(0).max(100),
  averageLatencyMs: z.number().nonnegative(),
  averageTokenUsage: z.number().nonnegative(),
  averageCostUsd: z.number().nonnegative(),
});

export const EvaluationRunSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  agentVersion: z.string().min(1),
  benchmarkType: z.enum(['GOLDEN', 'REGRESSION', 'ADVERSARIAL', 'PROMPT_INJECTION', 'TOOL_FAILURE', 'FULL_HARNESS']),
  targetState: AgentStateSchema,
  passed: z.boolean(),
  metrics: EvaluationMetricSchema,
  evaluatorJudgeId: z.string(),
  timestamp: z.number(),
});

export const CostRecordSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  taskId: z.string().min(1),
  modelProvider: z.string(),
  modelName: z.string(),
  promptTokens: z.number().int().nonnegative(),
  completionTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  costUsd: z.number().nonnegative(),
  latencyMs: z.number().nonnegative(),
  timestamp: z.number(),
});

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export type EvaluationRun = z.infer<typeof EvaluationRunSchema>;
export type CostRecord = z.infer<typeof CostRecordSchema>;
