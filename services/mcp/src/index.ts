export interface McpRoute { method: string; handler: string; capabilities: string[]; }
export class McpService { getRoutes(): McpRoute[] { return []; } }
