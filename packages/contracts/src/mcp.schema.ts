import { z } from 'zod';

export const McpJsonRpcRequestSchema = z.object({
  jsonrpc: z.literal('2.0'),
  id: z.union([z.string(), z.number()]),
  method: z.enum(['tools/list', 'tools/call']),
  params: z
    .object({
      name: z.string().optional(),
      arguments: z.record(z.string(), z.unknown()).optional(),
      capabilityTokenId: z.string().optional(),
      humanApprovalGranted: z.boolean().optional(),
    })
    .optional(),
});
