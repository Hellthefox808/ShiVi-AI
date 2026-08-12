import { z } from 'zod';

export const AgentStateSchema = z.enum([
  'DRAFT',
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

export const RiskLevelSchema = z.enum(['T0', 'T1', 'T2', 'T3', 'T4', 'T5']);

export const AgentManifestSchema = z.object({
  agentId: z.string().min(1),
  agentVersion: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  maxTrajectorySteps: z.number().min(1).max(50),
  allowedTools: z.array(z.string()),
  maxRiskLevel: RiskLevelSchema,
  state: AgentStateSchema,
  quarantineReason: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const AgentExecutionTaskSchema = z.object({
  taskId: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  agentVersion: z.string().min(1),
  inputPrompt: z.string().min(1),
  capabilityTokenId: z.string().min(1),
  humanApprovalGranted: z.boolean().optional(),
});
