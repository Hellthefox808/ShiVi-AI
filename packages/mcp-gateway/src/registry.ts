/**
 * ShiVi X100+ MCP Gateway — Tool Registry & Legacy Nex Refactoring
 * Standard: SAD v2.0 §18, TDA v1.1 §54-56, FTL-KER-003
 */

export interface ToolDefinition {
  toolId: string;
  name: string;
  description: string;
  version: string;
  riskLevel: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  inputSchema: Record<string, unknown>;
  handler: (args: Record<string, unknown>, context: { tenantId: string }) => Promise<unknown>;
}

export class ToolRegistry {
  private static registry = new Map<string, ToolDefinition>();

  public static registerTool(tool: ToolDefinition): void {
    this.registry.set(tool.toolId, tool);
  }

  public static getTool(toolId: string): ToolDefinition | undefined {
    return this.registry.get(toolId);
  }

  public static listTools(): ToolDefinition[] {
    return Array.from(this.registry.values());
  }

  /**
   * Bootstraps native MCP tools refactored from legacy .nex/flowstream node definitions
   */
  public static bootstrapLegacyNexTools(): void {
    // 1. list_files_code tool (T0 risk)
    this.registerTool({
      toolId: 'nex_list_files_code',
      name: 'list_files_code',
      description: 'Lists files in a given directory path',
      version: '1.0.0',
      riskLevel: 'T0',
      inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] },
      handler: async (args) => {
        return { files: [`file1.txt`, `file2.ts`], path: args.path };
      },
    });

    // 2. read_file_code tool (T0 risk)
    this.registerTool({
      toolId: 'nex_read_file_code',
      name: 'read_file_code',
      description: 'Reads contents of a file',
      version: '1.0.0',
      riskLevel: 'T0',
      inputSchema: { type: 'object', properties: { filePath: { type: 'string' } }, required: ['filePath'] },
      handler: async (args) => {
        return { content: `[Content of ${args.filePath}]`, filePath: args.filePath };
      },
    });

    // 3. create_file_code tool (T2 risk)
    this.registerTool({
      toolId: 'nex_create_file_code',
      name: 'create_file_code',
      description: 'Creates a new file with specified content',
      version: '1.0.0',
      riskLevel: 'T2',
      inputSchema: {
        type: 'object',
        properties: { filePath: { type: 'string' }, content: { type: 'string' } },
        required: ['filePath', 'content'],
      },
      handler: async (args) => {
        return { status: 'CREATED', filePath: args.filePath };
      },
    });

    // 4. replace_lines_code tool (T2 risk)
    this.registerTool({
      toolId: 'nex_replace_lines_code',
      name: 'replace_lines_code',
      description: 'Replaces specific line ranges in a target file',
      version: '1.0.0',
      riskLevel: 'T2',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { type: 'string' },
          targetContent: { type: 'string' },
          replacementContent: { type: 'string' },
        },
        required: ['filePath', 'targetContent', 'replacementContent'],
      },
      handler: async (args) => {
        return { status: 'MODIFIED', filePath: args.filePath };
      },
    });

    // 5. call_tool tool (T1 risk)
    this.registerTool({
      toolId: 'nex_call_tool',
      name: 'call_tool',
      description: 'Invokes a target tool with arguments',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: {
        type: 'object',
        properties: { targetToolId: { type: 'string' }, arguments: { type: 'object' } },
        required: ['targetToolId'],
      },
      handler: async (args, context) => {
        const target = ToolRegistry.getTool(args.targetToolId as string);
        if (!target) throw new Error(`Target tool '${args.targetToolId}' not found.`);
        return target.handler((args.arguments as Record<string, unknown>) || {}, context);
      },
    });
  }
}
