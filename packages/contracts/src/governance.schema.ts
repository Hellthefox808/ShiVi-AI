import { z } from 'zod';
import { RiskLevelSchema, AgentStateSchema } from './agent.schema.js';

// ─── Approval Status & Requests ─────────────────────────────────────────────

export const ApprovalStatusSchema = z.enum([
  'PENDING',
  'GRANTED',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'CANCELLED',
  'OVERRIDDEN',
]);

export const ApprovalRequestSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  agentId: z.string().min(1),
  taskId: z.string().min(1),
  actionType: z.string().min(1),
  riskLevel: RiskLevelSchema,
  summary: z.string().optional(),
  decision: z.string().optional(),
  reason: z.string().optional(),
  evidence: z.array(z.string()).optional(),
  confidence: z.number().optional(),
  proposedPayload: z.record(z.string(), z.unknown()).optional(),
  toolId: z.string().optional(),
  toolArguments: z.record(z.string(), z.unknown()).optional(),
  expectedEffect: z.string().optional(),
  status: ApprovalStatusSchema,
  requestedAt: z.number(),
  requestedBy: z.string().optional(),
  decidedAt: z.number().optional(),
  decidedBy: z.string().optional(),
  rejectionReason: z.string().optional(),
  overrideJustification: z.string().optional(),
});

// ─── Ownership Record ───────────────────────────────────────────────────────

export const OwnershipRecordSchema = z.object({
  businessOwner: z.string().min(1),
  technicalOwner: z.string().min(1),
  securityOwner: z.string().min(1),
  dataOwner: z.string().min(1),
  complianceOwner: z.string().min(1),
});

// ─── AI Asset & Inventory ───────────────────────────────────────────────────

export const AIAssetTypeSchema = z.enum([
  'AGENT',
  'MODEL',
  'PROMPT',
  'WORKFLOW',
  'TOOL',
  'MCP_SERVER',
  'EMBEDDING',
  'CLASSIFIER',
  'RERANKER',
  'EVALUATION_SUITE',
  'AI_FEATURE',
  'AI_VENDOR',
  'AI_INTEGRATION',
]);

export const AIAssetStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE',
  'DEPRECATED',
  'UNDER_REVIEW',
  'BLOCKED',
]);

export const ShadowAIClassificationSchema = z.enum([
  'KNOWN',
  'APPROVED',
  'UNAPPROVED',
  'UNKNOWN',
  'SHADOW',
]);

export const RiskFactorSchema = z.object({
  factor: z.string(),
  weight: z.number(),
  score: z.number(),
  explanation: z.string(),
  contribution: z.number().optional(),
});

export const AIRiskAssessmentSchema = z.object({
  riskTier: RiskLevelSchema,
  riskScore: z.number(),
  classification: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  factors: z.array(RiskFactorSchema),
  assessedAt: z.number(),
  assessedBy: z.string(),
});

export const AIGovernanceAssetSchema = z.object({
  assetId: z.string().min(1),
  tenantId: z.string().min(1),
  type: AIAssetTypeSchema,
  name: z.string().min(1),
  description: z.string(),
  owner: OwnershipRecordSchema,
  team: z.string(),
  purpose: z.string(),
  version: z.string(),
  status: AIAssetStatusSchema,
  riskTier: RiskLevelSchema,
  dataScope: z.array(z.string()),
  permissions: z.array(z.string()),
  dependencies: z.array(z.string()),
  provider: z.string(),
  environment: z.string(),
  shadowClassification: ShadowAIClassificationSchema,
  riskAssessment: AIRiskAssessmentSchema.optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ─── AI Bill of Materials (AI BOM) ──────────────────────────────────────────

export const AIBillOfMaterialsSchema = z.object({
  bomId: z.string(),
  assetId: z.string(),
  tenantId: z.string(),
  model: z.object({
    provider: z.string(),
    modelName: z.string(),
    version: z.string(),
  }),
  promptVersion: z.string(),
  tools: z.array(z.string()),
  knowledgeSources: z.array(z.string()),
  memoryScopes: z.array(z.string()),
  dependencies: z.array(z.string()),
  governingPolicies: z.array(z.string()),
  evaluationSuiteId: z.string(),
  generatedAt: z.number(),
  hash: z.string(),
});

// ─── Compliance Controls & Evidence ─────────────────────────────────────────

export const ComplianceFrameworkSchema = z.enum([
  'EU_AI_ACT',
  'GDPR',
  'SOC2',
  'ISO_27001',
  'HIPAA',
]);

export const ComplianceControlStatusSchema = z.enum([
  'PASS',
  'FAIL',
  'PARTIAL',
  'NOT_ASSESSED',
  'EXCEPTION',
]);

export const ComplianceExceptionSchema = z.object({
  exceptionId: z.string(),
  controlId: z.string(),
  tenantId: z.string(),
  owner: z.string(),
  reason: z.string(),
  riskAccepted: z.string(),
  expiresAt: z.number(),
  approvedBy: z.string(),
  mitigation: z.string(),
  createdAt: z.number(),
});

export const ComplianceEvidenceSchema = z.object({
  evidenceId: z.string(),
  controlId: z.string(),
  type: z.enum(['EVALUATION_RUN', 'TRACE', 'CONFIGURATION', 'DOCUMENT', 'APPROVAL_RECORD', 'AUDIT_BLOCK']),
  uri: z.string(),
  hash: z.string(),
  collectedAt: z.number(),
  metadata: z.record(z.string(), z.unknown()),
});

export const AIControlSchema = z.object({
  controlId: z.string(),
  tenantId: z.string(),
  framework: ComplianceFrameworkSchema,
  requirement: z.string(),
  description: z.string(),
  owner: z.string(),
  status: ComplianceControlStatusSchema,
  evidence: z.array(z.string()),
  lastEvaluatedAt: z.number(),
  nextReviewAt: z.number(),
  exceptions: z.array(ComplianceExceptionSchema),
});

// ─── Incidents ──────────────────────────────────────────────────────────────

export const IncidentTypeSchema = z.enum([
  'SECURITY',
  'AI_FAILURE',
  'POLICY_VIOLATION',
  'DATA_LEAK',
  'MODEL_REGRESSION',
  'TOOL_MISUSE',
  'TENANT_ISOLATION',
  'WORKFLOW_FAILURE',
]);

export const IncidentStatusSchema = z.enum([
  'DETECTED',
  'CLASSIFIED',
  'CONTAINED',
  'INVESTIGATING',
  'REMEDIATING',
  'VERIFIED',
  'DOCUMENTED',
  'CLOSED',
]);

export const IncidentTimelineEventSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  action: z.string(),
  actor: z.string(),
  details: z.string(),
});

export const AIIncidentRecordSchema = z.object({
  incidentId: z.string(),
  tenantId: z.string(),
  type: IncidentTypeSchema,
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  status: IncidentStatusSchema,
  title: z.string(),
  description: z.string(),
  affectedResources: z.array(z.string()),
  detectedAt: z.number(),
  detectedBy: z.string(),
  timeline: z.array(IncidentTimelineEventSchema),
  containmentActions: z.array(z.string()),
  remediationSteps: z.array(z.string()),
  rootCause: z.string().optional(),
  resolvedAt: z.number().optional(),
  resolvedBy: z.string().optional(),
});

// ─── Data Lineage & Contracts ───────────────────────────────────────────────

export const DataLineageStepSchema = z.enum([
  'SOURCE',
  'TRANSFORM',
  'STORAGE',
  'RETRIEVAL',
  'MODEL',
  'AGENT',
  'DECISION',
  'ACTION',
]);

export const DataLineageNodeSchema = z.object({
  nodeId: z.string(),
  tenantId: z.string(),
  step: DataLineageStepSchema,
  resourceId: z.string(),
  resourceType: z.string(),
  timestamp: z.number(),
  inputHash: z.string(),
  outputHash: z.string(),
  metadata: z.record(z.string(), z.unknown()),
});

export const DataContractSchema = z.object({
  contractId: z.string(),
  tenantId: z.string(),
  sourceSystem: z.string(),
  targetSystem: z.string(),
  schemaVersion: z.string(),
  expectedFields: z.array(z.object({
    name: z.string(),
    type: z.string(),
    required: z.boolean(),
    classification: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']),
  })),
  maxStalenessMs: z.number(),
  qualityThreshold: z.number(),
});

export const DataQualityMetricsSchema = z.object({
  completeness: z.number().min(0).max(100),
  accuracy: z.number().min(0).max(100),
  consistency: z.number().min(0).max(100),
  uniqueness: z.number().min(0).max(100),
  validity: z.number().min(0).max(100),
  timeliness: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
});

// ─── Enterprise AI Scorecard ────────────────────────────────────────────────

export const EnterpriseScorecardSchema = z.object({
  tenantId: z.string(),
  readinessScore: z.number().min(0).max(100),
  reliabilityScore: z.number().min(0).max(100),
  securityScore: z.number().min(0).max(100),
  governanceScore: z.number().min(0).max(100),
  dataQualityScore: z.number().min(0).max(100),
  operationalHealthScore: z.number().min(0).max(100),
  calculatedAt: z.number(),
});

// ─── Decision Provenance ────────────────────────────────────────────────────

export const DecisionProvenanceSchema = z.object({
  decisionId: z.string(),
  tenantId: z.string(),
  decision: z.string(),
  reason: z.string(),
  evidenceSources: z.array(z.string()),
  sourceFreshnessMs: z.number(),
  model: z.string(),
  agentId: z.string(),
  agentVersion: z.string(),
  policyId: z.string(),
  humanApprover: z.string().optional(),
  expectedOutcome: z.string(),
  verifiedOutcome: z.string().optional(),
  timestamp: z.number(),
  traceId: z.string(),
});

// ─── Evaluations & Cost ─────────────────────────────────────────────────────

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

// ─── Inferred Types ─────────────────────────────────────────────────────────

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export type OwnershipRecord = z.infer<typeof OwnershipRecordSchema>;
export type AIAssetType = z.infer<typeof AIAssetTypeSchema>;
export type AIAssetStatus = z.infer<typeof AIAssetStatusSchema>;
export type ShadowAIClassification = z.infer<typeof ShadowAIClassificationSchema>;
export type AIRiskAssessment = z.infer<typeof AIRiskAssessmentSchema>;
export type AIGovernanceAsset = z.infer<typeof AIGovernanceAssetSchema>;
export type AIBillOfMaterials = z.infer<typeof AIBillOfMaterialsSchema>;
export type ComplianceFramework = z.infer<typeof ComplianceFrameworkSchema>;
export type ComplianceControlStatus = z.infer<typeof ComplianceControlStatusSchema>;
export type ComplianceException = z.infer<typeof ComplianceExceptionSchema>;
export type ComplianceEvidence = z.infer<typeof ComplianceEvidenceSchema>;
export type AIControl = z.infer<typeof AIControlSchema>;
export type IncidentType = z.infer<typeof IncidentTypeSchema>;
export type IncidentStatus = z.infer<typeof IncidentStatusSchema>;
export type IncidentTimelineEvent = z.infer<typeof IncidentTimelineEventSchema>;
export type AIIncidentRecord = z.infer<typeof AIIncidentRecordSchema>;
export type DataLineageStep = z.infer<typeof DataLineageStepSchema>;
export type DataLineageNode = z.infer<typeof DataLineageNodeSchema>;
export type DataContract = z.infer<typeof DataContractSchema>;
export type DataQualityMetrics = z.infer<typeof DataQualityMetricsSchema>;
export type EnterpriseScorecard = z.infer<typeof EnterpriseScorecardSchema>;
export type DecisionProvenance = z.infer<typeof DecisionProvenanceSchema>;
export type EvaluationMetric = z.infer<typeof EvaluationMetricSchema>;
export type EvaluationRun = z.infer<typeof EvaluationRunSchema>;
export type CostRecord = z.infer<typeof CostRecordSchema>;
