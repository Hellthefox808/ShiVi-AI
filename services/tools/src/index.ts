export interface ToolDefinition { name: string; description: string; schema: unknown; }
export class ToolService { getTools(tenantId: string): ToolDefinition[] { return []; } }
