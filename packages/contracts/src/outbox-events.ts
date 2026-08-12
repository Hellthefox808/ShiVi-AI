/**
 * ShiVi X100+ Contracts — Transactional Outbox Domain Event Contracts
 * Standard: SAD v2.0 §16, TDA v1.1 §95
 */

import { z } from 'zod';

export const DomainEventSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  tenantId: z.string(),
  aggregateId: z.string(),
  aggregateType: z.string(),
  payload: z.record(z.unknown()),
  occurredAt: z.number(),
  status: z.enum(['PENDING', 'PUBLISHED', 'FAILED']),
});

export type DomainEvent = z.infer<typeof DomainEventSchema>;

export const SSEEventPayloadSchema = z.object({
  eventType: z.enum([
    'AGENT_STEP',
    'TOOL_EXECUTING',
    'TOOL_COMPLETED',
    'EVIDENCE_GENERATED',
    'STATE_CHANGED',
    'RECOVERY_TRIGGERED',
  ]),
  tenantId: z.string(),
  sessionId: z.string(),
  data: z.record(z.unknown()),
  timestamp: z.number(),
});

export type SSEEventPayload = z.infer<typeof SSEEventPayloadSchema>;
