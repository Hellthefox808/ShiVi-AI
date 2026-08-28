import { z } from 'zod';

export const BuyingCommitteeRoleSchema = z.enum([
  'CHAMPION',
  'ECONOMIC_BUYER',
  'TECHNICAL_BUYER',
  'PROCUREMENT',
  'LEGAL',
  'END_USER',
  'BLOCKER',
]);

export const AccountTierSchema = z.enum(['STRATEGIC', 'ENTERPRISE', 'MID_MARKET', 'GROWTH', 'SMB']);
export const OpportunityStageSchema = z.enum([
  'PROSPECTING',
  'QUALIFICATION',
  'NEEDS_ANALYSIS',
  'VALUE_PROPOSITION',
  'BUYING_COMMITTEE_ENGAGEMENT',
  'PROPOSAL_PRICE_QUOTE',
  'NEGOTIATION_REVIEW',
  'CLOSED_WON',
  'CLOSED_LOST',
]);

export const ForecastCategorySchema = z.enum(['PIPELINE', 'BEST_CASE', 'COMMIT', 'CLOSED', 'OMITTED']);

export const AccountSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(1),
  industry: z.string(),
  employees: z.number().int().nonnegative(),
  annualRevenue: z.number().nonnegative(),
  tier: AccountTierSchema,
  healthScore: z.number().min(0).max(100),
  status: z.enum(['ACTIVE', 'CHURN_RISK', 'CHURNED', 'PROSPECT']),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().int().default(1),
});

export const ContactSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  title: z.string(),
  roleInBuyingCommittee: BuyingCommitteeRoleSchema,
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  engagementScore: z.number().min(0).max(100),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().int().default(1),
});

export const LeadSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  company: z.string().min(1),
  title: z.string(),
  status: z.enum(['NEW', 'ENRICHING', 'QUALIFIED', 'UNQUALIFIED', 'ROUTED', 'ENGAGED']),
  source: z.string(),
  icpScore: z.number().min(0).max(100),
  qualificationScore: z.number().min(0).max(100),
  assignedRepId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().int().default(1),
});

export const OpportunitySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  accountId: z.string().min(1),
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().default('USD'),
  stage: OpportunityStageSchema,
  probability: z.number().min(0).max(100),
  closeDate: z.string(),
  forecastCategory: ForecastCategorySchema,
  riskScore: z.number().min(0).max(100),
  assignedRepId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  version: z.number().int().default(1),
});

export const ActivitySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  entityType: z.enum(['ACCOUNT', 'CONTACT', 'LEAD', 'OPPORTUNITY']),
  entityId: z.string().min(1),
  activityType: z.enum(['MEETING', 'EMAIL', 'CALL', 'NOTE', 'TASK', 'STAGE_CHANGE']),
  subject: z.string(),
  description: z.string(),
  performedBy: z.string(),
  timestamp: z.number(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});


export type Account = z.infer<typeof AccountSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Lead = z.infer<typeof LeadSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Activity = z.infer<typeof ActivitySchema>;
