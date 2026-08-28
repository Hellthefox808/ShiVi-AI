import { z } from 'zod';

export const RiskFactorSeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const RiskFactorSchema = z.object({
  code: z.string(),
  description: z.string(),
  severity: RiskFactorSeveritySchema,
  impactScore: z.number().min(0).max(100),
  suggestedAction: z.string(),
});

export const DealRiskSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  opportunityId: z.string().min(1),
  riskScore: z.number().min(0).max(100),
  riskFactors: z.array(RiskFactorSchema),
  stalledDays: z.number().nonnegative(),
  missingStakeholders: z.array(z.string()),
  nextBestAction: z.string(),
  detectedAt: z.number(),
  status: z.enum(['ACTIVE_RISK', 'MITIGATED', 'ACCEPTED']),
});

export const ForecastSnapshotSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  period: z.string(), // e.g. '2026-Q3'
  totalPipeline: z.number().nonnegative(),
  committedAmount: z.number().nonnegative(),
  bestCaseAmount: z.number().nonnegative(),
  weightedForecast: z.number().nonnegative(),
  aiAdjustedForecast: z.number().nonnegative(),
  confidenceInterval: z.object({
    lowerBound: z.number().nonnegative(),
    upperBound: z.number().nonnegative(),
  }),
  coverageRatio: z.number().nonnegative(),
  slippageRiskDeals: z.array(z.string()),
  timestamp: z.number(),
});

export const RenewalRecordSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  contractId: z.string().min(1),
  renewalDate: z.string(),
  arr: z.number().nonnegative(),
  churnRiskScore: z.number().min(0).max(100),
  churnReasons: z.array(z.string()),
  csmOwnerId: z.string(),
  status: z.enum(['HEALTHY', 'UPCOMING', 'AT_RISK', 'RENEWED', 'CHURNED']),
  lastOutreachAt: z.number().optional(),
});

export const ExpansionRecordSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  currentArr: z.number().nonnegative(),
  expansionPotential: z.number().nonnegative(),
  signalType: z.enum(['USAGE_SURGE', 'FEATURE_REQUEST', 'SEAT_LIMIT_REACHED', 'EXECUTIVE_HIRING']),
  recommendedProduct: z.string(),
  confidenceScore: z.number().min(0).max(100),
  status: z.enum(['IDENTIFIED', 'QUALIFYING', 'IN_PIPELINE', 'WON', 'DISMISSED']),
});

export const CustomerHealthSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  overallScore: z.number().min(0).max(100),
  usageScore: z.number().min(0).max(100),
  supportScore: z.number().min(0).max(100),
  sentimentScore: z.number().min(0).max(100),
  npsScore: z.number().min(-100).max(100),
  healthStatus: z.enum(['EXCELLENT', 'HEALTHY', 'WATCHLIST', 'AT_RISK', 'CRITICAL']),
  trend: z.enum(['IMPROVING', 'STABLE', 'DECLINING']),
  updatedAt: z.number(),
});

export type DealRisk = z.infer<typeof DealRiskSchema>;
export type ForecastSnapshot = z.infer<typeof ForecastSnapshotSchema>;
export type RenewalRecord = z.infer<typeof RenewalRecordSchema>;
export type ExpansionRecord = z.infer<typeof ExpansionRecordSchema>;
export type CustomerHealth = z.infer<typeof CustomerHealthSchema>;
