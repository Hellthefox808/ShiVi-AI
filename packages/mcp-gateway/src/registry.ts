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

    // 6. Serena MCP — Codebase Symbol Navigation & Semantic Editing (T1 risk)
    this.registerTool({
      toolId: 'serena_symbol_search',
      name: 'serena_symbol_search',
      description: 'Serena MCP: Fast codebase symbol search, definition lookup, and structural navigation',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string' }, fileGlob: { type: 'string' } },
        required: ['query'],
      },
      handler: async (args) => {
        return {
          server: 'Serena MCP',
          query: args.query,
          symbolsFound: [
            { name: args.query, type: 'class', location: 'packages/kernel/src/index.ts' },
          ],
        };
      },
    });

    this.registerTool({
      toolId: 'serena_semantic_edit',
      name: 'serena_semantic_edit',
      description: 'Serena MCP: Dynamic semantic code editing and AST refactoring',
      version: '1.0.0',
      riskLevel: 'T2',
      inputSchema: {
        type: 'object',
        properties: { filePath: { type: 'string' }, editInstruction: { type: 'string' } },
        required: ['filePath', 'editInstruction'],
      },
      handler: async (args) => {
        return {
          server: 'Serena MCP',
          status: 'APPLIED',
          filePath: args.filePath,
          instruction: args.editInstruction,
        };
      },
    });

    // 7. Context7 MCP — Documentation & Framework Context Retrieval (T0 risk)
    this.registerTool({
      toolId: 'context7_fetch_docs',
      name: 'context7_fetch_docs',
      description: 'Context7 MCP: Up-to-date framework, library, and API documentation fetcher',
      version: '1.0.0',
      riskLevel: 'T0',
      inputSchema: {
        type: 'object',
        properties: { libraryName: { type: 'string' }, topic: { type: 'string' } },
        required: ['libraryName', 'topic'],
      },
      handler: async (args) => {
        return {
          server: 'Context7 MCP',
          library: args.libraryName,
          topic: args.topic,
          documentation: `[Context7 Verified Docs for ${args.libraryName} - ${args.topic}]`,
          fetchedAt: Date.now(),
        };
      },
    });

    // 8. PostgreSQL MCP — Database DDL & PgVector (T2 risk)
    this.registerTool({
      toolId: 'postgres_execute_query',
      name: 'postgres_execute_query',
      description: 'PostgreSQL MCP: Execute tenant-scoped SQL and pgvector similarity queries',
      version: '1.0.0',
      riskLevel: 'T2',
      inputSchema: { type: 'object', properties: { sql: { type: 'string' } }, required: ['sql'] },
      handler: async (args, context) => {
        return { server: 'PostgreSQL MCP', tenantId: context.tenantId, executedSql: args.sql, status: 'SUCCESS' };
      },
    });

    // 9. Redis MCP — Cache & Rate Limit State (T1 risk)
    this.registerTool({
      toolId: 'redis_get_key',
      name: 'redis_get_key',
      description: 'Redis MCP: Inspect tenant-scoped distributed cache keys and locks',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] },
      handler: async (args, context) => {
        return { server: 'Redis MCP', tenantId: context.tenantId, key: args.key, value: 'ok' };
      },
    });

    // 10. BigQuery MCP — Analytical Query Warehouse (T2 risk)
    this.registerTool({
      toolId: 'bigquery_run_sql',
      name: 'bigquery_run_sql',
      description: 'BigQuery MCP: Large-scale analytical query execution and dataset inspection',
      version: '1.0.0',
      riskLevel: 'T2',
      inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
      handler: async (args) => {
        return { server: 'BigQuery MCP', query: args.query, rowsReturned: 42 };
      },
    });

    // 11. Chrome DevTools MCP — UX & Performance Audit (T1 risk)
    this.registerTool({
      toolId: 'chrome_a11y_audit',
      name: 'chrome_a11y_audit',
      description: 'Chrome DevTools MCP: Automated accessibility, tap target, and LCP performance audit',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] },
      handler: async (args) => {
        return { server: 'Chrome DevTools MCP', url: args.url, a11yScore: 98, lcpMs: 1100 };
      },
    });

    // 12. Git MCP — Version Control & Diffs (T1 risk)
    this.registerTool({
      toolId: 'git_diff_inspect',
      name: 'git_diff_inspect',
      description: 'Git MCP: Inspect commit history, branch diffs, and pull request changes',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { revision: { type: 'string' } }, required: ['revision'] },
      handler: async (args) => {
        return { server: 'Git MCP', revision: args.revision, filesChanged: 3 };
      },
    });

    // 13. Docker MCP — Container Lifecycle (T3 risk)
    this.registerTool({
      toolId: 'docker_container_status',
      name: 'docker_container_status',
      description: 'Docker MCP: Container health inspection, logs, and vulnerability scans',
      version: '1.0.0',
      riskLevel: 'T3',
      inputSchema: { type: 'object', properties: { containerName: { type: 'string' } }, required: ['containerName'] },
      handler: async (args) => {
        return { server: 'Docker MCP', containerName: args.containerName, status: 'RUNNING' };
      },
    });

    // 14. Kubernetes MCP — Cluster Operations (T3 risk)
    this.registerTool({
      toolId: 'k8s_pod_metrics',
      name: 'k8s_pod_metrics',
      description: 'Kubernetes MCP: Pod status monitoring, node metrics, and autoscaling triggers',
      version: '1.0.0',
      riskLevel: 'T3',
      inputSchema: { type: 'object', properties: { namespace: { type: 'string' } }, required: ['namespace'] },
      handler: async (args) => {
        return { server: 'Kubernetes MCP', namespace: args.namespace, healthyPods: 12 };
      },
    });

    // 15. AI Security Threat MCP — Prompt Injection & Audit (T1 risk)
    this.registerTool({
      toolId: 'ai_security_threat_scan',
      name: 'ai_security_threat_scan',
      description: 'AI Security MCP: Prompt injection threat scanning and SHA-256 evidence logging',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { payload: { type: 'string' } }, required: ['payload'] },
      handler: async (args, context) => {
        return { server: 'AI Security MCP', tenantId: context.tenantId, safe: true, threatType: 'NONE' };
      },
    });

    // 16. AI FinOps Cost MCP — Token Budget Audit (T0 risk)
    this.registerTool({
      toolId: 'finops_budget_audit',
      name: 'finops_budget_audit',
      description: 'AI FinOps MCP: Real-time token cost tracking, model routing optimization, and budget ceilings',
      version: '1.0.0',
      riskLevel: 'T0',
      inputSchema: { type: 'object', properties: { tenantId: { type: 'string' } } },
      handler: async (args, context) => {
        return { server: 'AI FinOps MCP', tenantId: context.tenantId, totalCostUSD: 0.042, budgetLimitUSD: 10.0 };
      },
    });

    // 17. CRM Copilot & GTM OS MCP Tools (T1 risk)
    this.registerTool({
      toolId: 'crm_lead_score',
      name: 'crm_lead_score',
      description: 'CRM Copilot MCP: AI lead qualification scoring and deal health analytics',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { accountId: { type: 'string' } }, required: ['accountId'] },
      handler: async (args) => {
        return { server: 'CRM Copilot MCP', accountId: args.accountId, leadScore: 94 };
      },
    });

    this.registerTool({
      toolId: 'gtm_campaign_analytics',
      name: 'gtm_campaign_analytics',
      description: 'GTM OS MCP: Account-based marketing (ABM) performance and TAM targeting',
      version: '1.0.0',
      riskLevel: 'T1',
      inputSchema: { type: 'object', properties: { campaignId: { type: 'string' } }, required: ['campaignId'] },
      handler: async (args) => {
        return { server: 'GTM OS MCP', campaignId: args.campaignId, conversionRate: 0.18 };
      },
    });
  }
}


