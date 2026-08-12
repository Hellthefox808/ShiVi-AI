import { z } from 'zod';

export const DataClassificationSchema = z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']);

export const TenantPolicySchema = z.object({
  allowedRegions: z.array(z.string()),
  maxRetentionDays: z.number().min(1).max(3650),
  dataClassificationLimit: DataClassificationSchema,
  customEncryptionKeyRequired: z.boolean(),
  vectorIsolationEnabled: z.boolean(),
  agentMemoryIsolationEnabled: z.boolean(),
});

export const TenancyContextSchema = z.object({
  tenantId: z.string().min(1),
  organizationId: z.string().min(1),
  environment: z.enum(['local', 'dev', 'test', 'staging', 'canary', 'production', 'research', 'high-assurance']),
  homeRegion: z.string().min(1),
  policy: TenantPolicySchema,
});
