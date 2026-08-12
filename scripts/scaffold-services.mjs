#!/usr/bin/env node
/**
 * ShiVi X100+ Frontend & Backend Services Scaffolder
 * Creates frontend apps/packages, backend services, and workers
 */
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

function pkg(name, desc) {
  return JSON.stringify({ name: `@shivi/${name}`, version: '1.0.0', type: 'module', description: desc, main: 'dist/index.js', types: 'dist/index.d.ts', scripts: { build: 'tsc', typecheck: 'tsc --noEmit' } }, null, 2) + '\n';
}

function tsconfig(depth) {
  const rel = '../'.repeat(depth) + 'tsconfig.base.json';
  return JSON.stringify({ extends: rel, compilerOptions: { outDir: './dist', rootDir: './src' }, include: ['src/**/*'] }, null, 2) + '\n';
}

function scaffold(dir, name, desc, content, depth = 2) {
  if (existsSync(join(dir, 'src', 'index.ts'))) return false;
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'package.json'), pkg(name, desc));
  writeFileSync(join(dir, 'tsconfig.json'), tsconfig(depth));
  writeFileSync(join(dir, 'src', 'index.ts'), content);
  return true;
}

let created = 0;

// ─── Frontend Apps ──────────────────────────────────────────
const feApps = [
  ['web', 'app-web', 'ShiVi Web — Next.js 15 + React 19.2 Production Frontend', `/**
 * ShiVi Web Application — Next.js 15 + React 19.2
 * Production frontend with SSR, streaming, and server components
 */
export interface WebAppConfig {
  readonly basePath: string;
  readonly apiBaseUrl: string;
  readonly enableSSR: boolean;
  readonly enableStreaming: boolean;
  readonly theme: 'light' | 'dark' | 'system';
}

export interface PageMetadata {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
  readonly openGraph: { title: string; description: string; image: string };
}

export class ShiViWebApp {
  constructor(private config: WebAppConfig) {}
  getConfig(): WebAppConfig { return this.config; }
}
`],
  ['admin', 'app-admin', 'ShiVi Admin Dashboard — Tenant & System Administration', `export interface AdminConfig { readonly basePath: string; readonly superAdminOnly: boolean; }
export class AdminApp { constructor(private config: AdminConfig) {} }
`],
  ['ai-studio', 'app-ai-studio', 'ShiVi AI Studio — Agent Builder, Prompt Engineering, Model Playground', `export interface AIStudioConfig { readonly basePath: string; readonly modelPlaygroundEnabled: boolean; readonly maxConcurrentAgents: number; }
export class AIStudioApp { constructor(private config: AIStudioConfig) {} }
`],
  ['developer-portal', 'app-developer-portal', 'ShiVi Developer Portal — API Docs, SDK, CLI, Guides', `export interface DevPortalConfig { readonly basePath: string; readonly apiDocsEnabled: boolean; readonly sandboxEnabled: boolean; }
export class DeveloperPortalApp { constructor(private config: DevPortalConfig) {} }
`],
  ['marketplace', 'app-marketplace', 'ShiVi Marketplace — Agent, Tool, and Extension Marketplace', `export interface MarketplaceConfig { readonly basePath: string; readonly reviewEnabled: boolean; }
export class MarketplaceApp { constructor(private config: MarketplaceConfig) {} }
`],
  ['analytics', 'app-analytics', 'ShiVi Analytics Dashboard — Business Intelligence & KPIs', `export interface AnalyticsConfig { readonly basePath: string; readonly refreshIntervalMs: number; }
export class AnalyticsDashboard { constructor(private config: AnalyticsConfig) {} }
`],
];

for (const [slug, name, desc, content] of feApps) {
  if (scaffold(join(ROOT, 'frontend', 'apps', slug), name, desc, content, 3)) created++;
}

// ─── Frontend Packages ──────────────────────────────────────
const fePackages = [
  ['design-system', 'design-system', 'ShiVi Design System — 24 components × 15 states', `/**
 * ShiVi Design System
 * 24 enterprise components with 15 documented states each
 */
export type ComponentState = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading' | 'success' | 'warning' | 'error' | 'readonly' | 'unauthorized' | 'degraded' | 'offline' | 'approval_required' | 'quarantined';

export interface ComponentProps { state?: ComponentState; className?: string; disabled?: boolean; }

// Core Components
export interface ButtonProps extends ComponentProps { variant: 'primary' | 'secondary' | 'ghost' | 'destructive'; size: 'sm' | 'md' | 'lg'; }
export interface InputProps extends ComponentProps { type: 'text' | 'email' | 'password' | 'search' | 'number'; placeholder?: string; }
export interface SelectProps extends ComponentProps { options: { label: string; value: string }[]; multiple?: boolean; }
export interface DialogProps extends ComponentProps { open: boolean; onClose: () => void; title: string; }
export interface DrawerProps extends ComponentProps { open: boolean; side: 'left' | 'right'; onClose: () => void; }
export interface TableProps extends ComponentProps { columns: unknown[]; data: unknown[]; sortable?: boolean; }
export interface DataGridProps extends ComponentProps { columns: unknown[]; rows: unknown[]; virtualScroll?: boolean; }

// Data Visualization
export interface ChartProps extends ComponentProps { type: 'bar' | 'line' | 'pie' | 'area' | 'scatter'; data: unknown; }
export interface TimelineProps extends ComponentProps { events: { timestamp: string; label: string; type: string }[]; }

// Platform Components
export interface CommandPaletteProps extends ComponentProps { commands: { id: string; label: string; action: () => void }[]; }
export interface ToastProps extends ComponentProps { variant: 'info' | 'success' | 'warning' | 'error'; message: string; }
export interface NotificationCenterProps extends ComponentProps { notifications: unknown[]; unreadCount: number; }
export interface ApprovalPanelProps extends ComponentProps { request: unknown; onApprove: () => void; onReject: () => void; }
export interface AgentPanelProps extends ComponentProps { agentId: string; agentState: string; trajectory: unknown[]; }
export interface ToolActivityProps extends ComponentProps { toolName: string; invocations: unknown[]; }
export interface EvidencePanelProps extends ComponentProps { evidenceChain: unknown[]; verified: boolean; }
export interface PolicyStatusProps extends ComponentProps { policies: { name: string; status: 'pass' | 'fail' | 'pending' }[]; }
export interface RiskBadgeProps extends ComponentProps { tier: 'T0' | 'T1' | 'T2' | 'T3' | 'T4' | 'T5'; }
export interface SecurityAlertProps extends ComponentProps { severity: 'low' | 'medium' | 'high' | 'critical'; message: string; }
export interface WorkflowCanvasProps extends ComponentProps { nodes: unknown[]; edges: unknown[]; onNodeClick: (id: string) => void; }
export interface AgentCanvasProps extends ComponentProps { agents: unknown[]; connections: unknown[]; }
export interface KnowledgeGraphProps extends ComponentProps { nodes: unknown[]; edges: unknown[]; layout: 'force' | 'tree' | 'radial'; }
export interface TraceViewerProps extends ComponentProps { traceId: string; spans: unknown[]; }
`],
  ['icons', 'icons', 'ShiVi Icon Library', `export type IconName = 'agent' | 'workflow' | 'security' | 'analytics' | 'settings' | 'tenant' | 'model' | 'tool' | 'evidence' | 'risk' | 'search' | 'notification' | 'dashboard' | 'chart' | 'code' | 'deploy' | 'monitor' | 'shield' | 'key' | 'globe';
export interface IconProps { name: IconName; size?: number; color?: string; }
`],
  ['charts', 'charts', 'ShiVi Chart Library — Recharts/ECharts wrappers', `export interface ChartData { labels: string[]; datasets: { label: string; data: number[]; color?: string }[]; }
export interface BarChartProps { data: ChartData; stacked?: boolean; horizontal?: boolean; }
export interface LineChartProps { data: ChartData; smooth?: boolean; area?: boolean; }
export interface PieChartProps { data: ChartData; donut?: boolean; }
export interface GaugeChartProps { value: number; min: number; max: number; thresholds: { value: number; color: string }[]; }
export interface FunnelChartProps { stages: { label: string; value: number }[]; }
export interface HeatmapChartProps { data: number[][]; xLabels: string[]; yLabels: string[]; }
export interface SankeyChartProps { nodes: { name: string }[]; links: { source: number; target: number; value: number }[]; }
export interface TreemapChartProps { data: { name: string; value: number; children?: unknown[] }[]; }
`],
  ['tables', 'tables', 'ShiVi Table Library — TanStack Table integration', `export interface ColumnDef<T = unknown> { id: string; header: string; accessor: keyof T | ((row: T) => unknown); sortable?: boolean; filterable?: boolean; width?: number; }
export interface TableConfig<T = unknown> { columns: ColumnDef<T>[]; data: T[]; pagination?: { pageSize: number; pageIndex: number }; sorting?: { id: string; desc: boolean }[]; globalFilter?: string; virtualScroll?: boolean; }
`],
  ['api-client', 'api-client', 'ShiVi API Client — Generated from OpenAPI', `export interface ApiConfig { baseUrl: string; apiKey?: string; timeout: number; retries: number; }
export interface ApiResponse<T> { data: T; status: number; headers: Record<string, string>; }
export interface PaginatedResponse<T> { items: T[]; total: number; page: number; pageSize: number; hasMore: boolean; }
export interface ApiError { code: string; message: string; details?: unknown; }
export class ShiViApiClient { constructor(private config: ApiConfig) {}
  async get<T>(path: string): Promise<ApiResponse<T>> { return { data: {} as T, status: 200, headers: {} }; }
  async post<T>(path: string, body: unknown): Promise<ApiResponse<T>> { return { data: {} as T, status: 201, headers: {} }; }
}
`],
  ['auth-client', 'auth-client', 'ShiVi Auth Client — SSO, MFA, Session Management', `export interface AuthSession { userId: string; tenantId: string; roles: string[]; expiresAt: string; accessToken: string; }
export interface LoginCredentials { email: string; password: string; mfaCode?: string; }
export interface SSOConfig { provider: 'google' | 'microsoft' | 'okta' | 'saml'; clientId: string; redirectUri: string; }
export class ShiViAuthClient { constructor(private baseUrl: string) {}
  async login(creds: LoginCredentials): Promise<AuthSession> { return {} as AuthSession; }
  async logout(): Promise<void> {}
  async refreshToken(): Promise<AuthSession> { return {} as AuthSession; }
}
`],
  ['telemetry-client', 'telemetry-client', 'ShiVi Frontend Telemetry — RUM, Error Tracking, Analytics', `export interface TelemetryEvent { name: string; properties: Record<string, unknown>; timestamp: string; }
export interface PerformanceMetric { name: string; value: number; unit: 'ms' | 'bytes' | 'count'; }
export class FrontendTelemetry { constructor(private endpoint: string) {}
  trackEvent(event: TelemetryEvent): void {}
  trackError(error: Error, context?: Record<string, unknown>): void {}
  trackPerformance(metric: PerformanceMetric): void {}
}
`],
  ['validation', 'validation', 'ShiVi Frontend Validation — Zod schemas for forms', `export const emailSchema = { parse: (v: string) => v.includes('@') };
export const passwordSchema = { parse: (v: string) => v.length >= 8 };
export const tenantIdSchema = { parse: (v: string) => v.length > 0 };
`],
  ['feature-flags', 'feature-flags', 'ShiVi Feature Flags — Progressive rollout, A/B testing', `export interface FeatureFlag { key: string; enabled: boolean; variant?: string; }
export interface FeatureFlagConfig { endpoint: string; refreshIntervalMs: number; }
export class FeatureFlagClient { constructor(private config: FeatureFlagConfig) {}
  isEnabled(key: string): boolean { return false; }
  getVariant(key: string): string | undefined { return undefined; }
}
`],
  ['state', 'state', 'ShiVi Frontend State — Zustand stores for client-side state', `export interface UIState { sidebarOpen: boolean; theme: 'light' | 'dark' | 'system'; commandPaletteOpen: boolean; activeModal: string | null; }
export interface NavigationState { currentPath: string; breadcrumbs: { label: string; path: string }[]; }
export interface NotificationState { items: unknown[]; unreadCount: number; }
export function createUIStore(initial?: Partial<UIState>): UIState { return { sidebarOpen: true, theme: 'system', commandPaletteOpen: false, activeModal: null, ...initial }; }
`],
];

for (const [slug, name, desc, content] of fePackages) {
  if (scaffold(join(ROOT, 'frontend', 'packages', slug), name, desc, content, 3)) created++;
}

// ─── Backend Services ───────────────────────────────────────
const services = [
  ['identity', 'service-identity', 'Identity Service — SPIFFE, SSO, MFA', `export interface IdentityProvider { type: 'spiffe' | 'oidc' | 'saml'; config: Record<string, unknown>; }
export class IdentityService { validateIdentity(token: string): boolean { return token.length > 0; } }
`],
  ['tenancy', 'service-tenancy', 'Tenancy Service — Tenant provisioning, isolation, plans', `export interface TenantProvisionRequest { tenantId: string; plan: string; region: string; }
export class TenancyService { provisionTenant(req: TenantProvisionRequest): { success: boolean } { return { success: true }; } }
`],
  ['authorization', 'service-authorization', 'Authorization Service — OpenFGA/OPA policy evaluation', `export interface AuthzDecision { allowed: boolean; reason: string; }
export class AuthorizationService { evaluate(subject: string, action: string, resource: string): AuthzDecision { return { allowed: true, reason: 'allowed' }; } }
`],
  ['policy', 'service-policy', 'Policy Service — Risk tiers, governance rules', `export interface PolicyRule { id: string; effect: 'allow' | 'deny'; conditions: Record<string, unknown>; }
export class PolicyService { evaluatePolicy(rules: PolicyRule[]): boolean { return true; } }
`],
  ['crm', 'service-crm', 'CRM Service — Contacts, deals, activities', `export interface Contact { id: string; name: string; email: string; company: string; }
export class CRMService { getContacts(tenantId: string): Contact[] { return []; } }
`],
  ['gtm', 'service-gtm', 'GTM Service — Campaigns, ICP, pipeline', `export interface Campaign { id: string; name: string; status: string; budget: number; }
export class GTMService { getCampaigns(tenantId: string): Campaign[] { return []; } }
`],
  ['revops', 'service-revops', 'RevOps Service — Revenue analytics, attribution', `export interface RevenueMetric { period: string; arr: number; mrr: number; churn: number; }
export class RevOpsService { getMetrics(tenantId: string): RevenueMetric[] { return []; } }
`],
  ['sales', 'service-sales', 'Sales Service — Pipeline, forecasting, coaching', `export interface Deal { id: string; name: string; stage: string; value: number; probability: number; }
export class SalesService { getDeals(tenantId: string): Deal[] { return []; } }
`],
  ['marketing', 'service-marketing', 'Marketing Service — Campaigns, leads, attribution', `export interface Lead { id: string; email: string; score: number; source: string; }
export class MarketingService { getLeads(tenantId: string): Lead[] { return []; } }
`],
  ['customer-success', 'service-customer-success', 'Customer Success Service — Health scores, churn', `export interface CustomerHealth { customerId: string; score: number; risk: 'low' | 'medium' | 'high'; }
export class CustomerSuccessService { getHealth(tenantId: string): CustomerHealth[] { return []; } }
`],
  ['support', 'service-support', 'Support Service — Tickets, SLA, escalation', `export interface Ticket { id: string; subject: string; priority: string; status: string; }
export class SupportService { getTickets(tenantId: string): Ticket[] { return []; } }
`],
  ['finance', 'service-finance', 'Finance Service — Billing, invoicing, revenue', `export interface Invoice { id: string; amount: number; currency: string; status: string; }
export class FinanceService { getInvoices(tenantId: string): Invoice[] { return []; } }
`],
  ['procurement', 'service-procurement', 'Procurement Service — Vendors, POs, approvals', `export interface PurchaseOrder { id: string; vendor: string; amount: number; status: string; }
export class ProcurementService { getPOs(tenantId: string): PurchaseOrder[] { return []; } }
`],
  ['itops', 'service-itops', 'IT Ops Service — Incidents, changes, CMDB', `export interface Incident { id: string; title: string; severity: string; status: string; }
export class ITOpsService { getIncidents(tenantId: string): Incident[] { return []; } }
`],
  ['workflows', 'service-workflows', 'Workflow Service — Temporal orchestration', `export interface WorkflowDef { id: string; name: string; steps: unknown[]; version: number; }
export class WorkflowService { execute(def: WorkflowDef): { executionId: string } { return { executionId: 'wf-001' }; } }
`],
  ['agents', 'service-agents', 'Agent Service — Fleet management, lifecycle', `export interface AgentFleetStatus { total: number; active: number; quarantined: number; }
export class AgentService { getFleetStatus(tenantId: string): AgentFleetStatus { return { total: 0, active: 0, quarantined: 0 }; } }
`],
  ['tools', 'service-tools', 'Tool Service — Registry, execution, ACL', `export interface ToolDefinition { name: string; description: string; schema: unknown; }
export class ToolService { getTools(tenantId: string): ToolDefinition[] { return []; } }
`],
  ['mcp', 'service-mcp', 'MCP Protocol Service — JSON-RPC 2.0 routing', `export interface McpRoute { method: string; handler: string; capabilities: string[]; }
export class McpService { getRoutes(): McpRoute[] { return []; } }
`],
  ['a2a', 'service-a2a', 'A2A Protocol Service — Agent-to-Agent communication', `export interface A2AMessage { from: string; to: string; type: string; payload: unknown; }
export class A2AService { send(msg: A2AMessage): { delivered: boolean } { return { delivered: true }; } }
`],
  ['rag', 'service-rag', 'RAG Service — Retrieval pipeline, indexing, chunks', `export interface RAGQuery { query: string; topK: number; filters: Record<string, unknown>; }
export class RAGService { retrieve(q: RAGQuery): { chunks: unknown[]; scores: number[] } { return { chunks: [], scores: [] }; } }
`],
  ['search', 'service-search', 'Search Service — Enterprise semantic search', `export interface SearchQuery { query: string; scope: string[]; limit: number; }
export class SearchService { search(q: SearchQuery): { results: unknown[] } { return { results: [] }; } }
`],
  ['memory', 'service-memory', 'Memory Service — Agent memory, context windows', `export interface MemoryEntry { key: string; value: unknown; ttlSeconds: number; }
export class MemoryService { store(entry: MemoryEntry): void {} recall(key: string): unknown { return null; } }
`],
  ['analytics', 'service-analytics', 'Analytics Service — Metrics, KPIs, dashboards', `export interface AnalyticsQuery { metric: string; dimensions: string[]; timeRange: { start: string; end: string }; }
export class AnalyticsService { query(q: AnalyticsQuery): { data: unknown[] } { return { data: [] }; } }
`],
  ['billing', 'service-billing', 'Billing Service — Metering, subscriptions, usage', `export interface UsageRecord { tenantId: string; metric: string; quantity: number; timestamp: string; }
export class BillingService { recordUsage(record: UsageRecord): void {} }
`],
  ['notifications', 'service-notifications', 'Notification Service — Multi-channel dispatch', `export interface Notification { channel: 'email' | 'sms' | 'push' | 'slack'; recipient: string; template: string; data: Record<string, unknown>; }
export class NotificationService { send(n: Notification): { sent: boolean } { return { sent: true }; } }
`],
  ['audit', 'service-audit', 'Audit Service — Audit trails, compliance logs', `export interface AuditEntry { action: string; actor: string; resource: string; timestamp: string; }
export class AuditService { log(entry: AuditEntry): void {} }
`],
  ['observability', 'service-observability', 'Observability Service — Traces, metrics, logs', `export interface ObservabilityConfig { otelEndpoint: string; samplingRate: number; }
export class ObservabilityService { constructor(private config: ObservabilityConfig) {} }
`],
];

for (const [slug, name, desc, content] of services) {
  if (scaffold(join(ROOT, 'services', slug), name, desc, content, 2)) created++;
}

// ─── Workers ────────────────────────────────────────────────
const workers = [
  ['agent-worker', 'worker-agent', 'Agent Worker — Task execution, trajectory recording', `export interface AgentTask { agentId: string; taskId: string; payload: unknown; }
export class AgentWorker { async process(task: AgentTask): Promise<{ success: boolean }> { return { success: true }; } }
`],
  ['ingestion-worker', 'worker-ingestion', 'Ingestion Worker — Document/data ingestion pipeline', `export interface IngestionJob { sourceUrl: string; format: string; tenantId: string; }
export class IngestionWorker { async process(job: IngestionJob): Promise<{ chunksCreated: number }> { return { chunksCreated: 0 }; } }
`],
  ['event-worker', 'worker-event', 'Event Worker — CloudEvents processing', `export interface EventBatch { events: unknown[]; source: string; }
export class EventWorker { async process(batch: EventBatch): Promise<{ processed: number }> { return { processed: batch.events.length }; } }
`],
  ['notification-worker', 'worker-notification', 'Notification Worker — Delivery, retry, tracking', `export interface NotificationJob { channel: string; recipient: string; template: string; }
export class NotificationWorker { async deliver(job: NotificationJob): Promise<{ delivered: boolean }> { return { delivered: true }; } }
`],
  ['analytics-worker', 'worker-analytics', 'Analytics Worker — Aggregation, rollups, reports', `export interface AnalyticsJob { metric: string; aggregation: 'sum' | 'avg' | 'count'; period: string; }
export class AnalyticsWorker { async aggregate(job: AnalyticsJob): Promise<{ result: number }> { return { result: 0 }; } }
`],
  ['scheduled-worker', 'worker-scheduled', 'Scheduled Worker — Cron jobs, recurring tasks', `export interface ScheduledJob { name: string; cron: string; handler: string; enabled: boolean; }
export class ScheduledWorker { async execute(job: ScheduledJob): Promise<{ success: boolean }> { return { success: true }; } }
`],
];

for (const [slug, name, desc, content] of workers) {
  if (scaffold(join(ROOT, 'workers', slug), name, desc, content, 2)) created++;
}

// ─── BFF App ────────────────────────────────────────────────
scaffold(join(ROOT, 'apps', 'bff'), 'app-bff', 'ShiVi BFF — Backend-for-Frontend aggregation layer', `/**
 * ShiVi BFF — Backend-for-Frontend
 * Aggregates multiple backend service calls into optimized view models
 */
export interface DashboardViewModel {
  readonly pipeline: { deals: number; value: number; velocity: number };
  readonly agents: { active: number; quarantined: number; total: number };
  readonly revenue: { mrr: number; arr: number; growthPct: number };
  readonly security: { score: number; incidents: number; alerts: number };
  readonly ai: { costUsd: number; budget: number; requests: number };
}

export class BFFService {
  async getDashboard(tenantId: string): Promise<DashboardViewModel> {
    return {
      pipeline: { deals: 0, value: 0, velocity: 0 },
      agents: { active: 0, quarantined: 0, total: 0 },
      revenue: { mrr: 0, arr: 0, growthPct: 0 },
      security: { score: 100, incidents: 0, alerts: 0 },
      ai: { costUsd: 0, budget: 1000, requests: 0 },
    };
  }
}
`, 2);
created++;

console.log(`\n✅ Frontend & Backend scaffolding complete:`);
console.log(`   Created: ${created} packages/services/workers`);
console.log(`   Frontend: ${feApps.length} apps + ${fePackages.length} packages`);
console.log(`   Backend: ${services.length} services + ${workers.length} workers + 1 BFF`);
