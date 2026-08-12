/**
 * ShiVi X100+ MCP Gateway — JSON-RPC Protocol Boundary Server
 * Standard: SAD v2.0 §18, TDA v1.1 §55
 */

import { CapabilityBroker, TenancyContext } from '@shivi/kernel';
import { EvidenceLedger } from '@shivi/security';
import { ToolRegistry } from './registry.js';

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'tools/list' | 'tools/call';
  params?: {
    name?: string;
    arguments?: Record<string, unknown>;
    capabilityTokenId?: string;
    humanApprovalGranted?: boolean;
  };
}

export interface McpJsonRpcResponse<T = unknown> {
  jsonrpc: '2.0';
  id: string | number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

export class McpGatewayServer {
  /**
   * Handle incoming MCP JSON-RPC 2.0 protocol request
   */
  public static async handleRequest(
    tenancyContext: TenancyContext,
    request: McpJsonRpcRequest
  ): Promise<McpJsonRpcResponse> {
    if (request.jsonrpc !== '2.0') {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32600, message: 'Invalid JSON-RPC version. Expected "2.0".' },
      };
    }

    if (request.method === 'tools/list') {
      const tools = ToolRegistry.listTools().map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }));
      return { jsonrpc: '2.0', id: request.id, result: { tools } };
    }

    if (request.method === 'tools/call') {
      const toolName = request.params?.name;
      const toolArgs = request.params?.arguments || {};
      const tokenId = request.params?.capabilityTokenId;
      const approval = request.params?.humanApprovalGranted || false;

      if (!toolName) {
        return { jsonrpc: '2.0', id: request.id, error: { code: -32602, message: 'Missing tool name parameter.' } };
      }

      const tool = ToolRegistry.listTools().find((t) => t.name === toolName || t.toolId === toolName);
      if (!tool) {
        return { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: `Tool '${toolName}' not found in registry.` } };
      }

      // 1. Governance & Capability Token Validation
      if (tokenId) {
        try {
          CapabilityBroker.validateCapabilityExecution(tokenId, tool.riskLevel, approval);
        } catch (err) {
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32000, message: (err as Error).message },
          };
        }
      }

      // 2. Execute Tool Handler
      try {
        const output = await tool.handler(toolArgs, { tenantId: tenancyContext.tenantId });

        // 3. Record Audit Evidence
        EvidenceLedger.appendEvidence(
          tenancyContext.tenantId,
          'mcp-gateway',
          `TOOL_EXECUTION:${tool.name}`,
          tool.riskLevel,
          { toolId: tool.toolId, arguments: toolArgs }
        );

        return {
          jsonrpc: '2.0',
          id: request.id,
          result: { content: [{ type: 'text', text: JSON.stringify(output) }] },
        };
      } catch (err) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: { code: -32603, message: `Internal tool execution error: ${(err as Error).message}` },
        };
      }
    }

    return { jsonrpc: '2.0', id: request.id, error: { code: -32601, message: `Method '${request.method}' not supported.` } };
  }
}
