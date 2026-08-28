import { z } from 'zod';

export const MemoryTierSchema = z.enum([
  'WORKING',
  'TASK',
  'USER',
  'AGENT',
  'ACCOUNT',
  'ORGANIZATION',
  'KNOWLEDGE',
  'EVALUATION',
]);

export const DocumentClassificationSchema = z.enum([
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'RESTRICTED',
]);

export const DocumentSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  title: z.string().min(1),
  source: z.string(),
  uri: z.string(),
  mimeType: z.string(),
  classification: DocumentClassificationSchema,
  version: z.number().int().default(1),
  sha256Hash: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const ChunkSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  documentId: z.string().min(1),
  chunkIndex: z.number().int().nonnegative(),
  content: z.string().min(1),
  tokenCount: z.number().int().positive(),
  sha256Hash: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CitationSchema = z.object({
  citationId: z.string().min(1),
  chunkId: z.string().min(1),
  documentId: z.string().min(1),
  documentTitle: z.string(),
  snippet: z.string(),
  confidence: z.number().min(0).max(1),
  provenanceUri: z.string(),
});

export const KnowledgeGraphNodeSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  label: z.string().min(1),
  nodeType: z.enum(['ACCOUNT', 'CONTACT', 'OPPORTUNITY', 'PRODUCT', 'COMPETITOR', 'RISK', 'DOCUMENT', 'AGENT']),
  properties: z.record(z.string(), z.unknown()),
});

export const KnowledgeGraphEdgeSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  sourceNodeId: z.string().min(1),
  targetNodeId: z.string().min(1),
  relationship: z.string().min(1), // e.g. 'CHAMPIONS', 'BLOCKED_BY', 'COMPETING_WITH', 'REFERENCED_IN'
  weight: z.number().default(1.0),
  properties: z.record(z.string(), z.unknown()).optional(),
});


export const MemoryItemSchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  memoryTier: MemoryTierSchema,
  scopeId: z.string().min(1), // e.g. agentId, accountId, userId
  key: z.string().min(1),
  value: z.unknown(),
  confidence: z.number().min(0).max(1),
  ttlSeconds: z.number().int().positive().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Document = z.infer<typeof DocumentSchema>;
export type Chunk = z.infer<typeof ChunkSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type KnowledgeGraphNode = z.infer<typeof KnowledgeGraphNodeSchema>;
export type KnowledgeGraphEdge = z.infer<typeof KnowledgeGraphEdgeSchema>;
export type MemoryItem = z.infer<typeof MemoryItemSchema>;
