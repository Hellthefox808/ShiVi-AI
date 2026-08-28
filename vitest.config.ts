import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Core Packages
      '@shivi/kernel': path.resolve(__dirname, './packages/kernel/src/index.ts'),
      '@shivi/contracts': path.resolve(__dirname, './packages/contracts/src/index.ts'),
      '@shivi/database': path.resolve(__dirname, './packages/database/src/index.ts'),
      '@shivi/telemetry': path.resolve(__dirname, './packages/telemetry/src/index.ts'),
      '@shivi/security': path.resolve(__dirname, './packages/security/src/index.ts'),
      '@shivi/ai-sdk': path.resolve(__dirname, './packages/ai-sdk/src/index.ts'),
      '@shivi/agent-runtime': path.resolve(__dirname, './packages/agent-runtime/src/index.ts'),
      '@shivi/mcp-gateway': path.resolve(__dirname, './packages/mcp-gateway/src/index.ts'),
      '@shivi/ui': path.resolve(__dirname, './packages/ui/src/index.ts'),
      '@shivi/resilience': path.resolve(__dirname, './packages/resilience/src/index.ts'),
      '@shivi/chaos-redteam': path.resolve(__dirname, './packages/chaos-redteam/src/index.ts'),
      '@shivi/dev-platform': path.resolve(__dirname, './packages/dev-platform/src/index.ts'),

      // Core Apps
      '@shivi/app-kernel-api': path.resolve(__dirname, './apps/kernel-api/src/index.ts'),
      '@shivi/app-command-center': path.resolve(__dirname, './apps/command-center/src/index.ts'),
      '@shivi/app-bff': path.resolve(__dirname, './apps/bff/src/index.ts'),

      // Microservices
      '@shivi/service-identity': path.resolve(__dirname, './services/identity/src/index.ts'),
      '@shivi/service-tenancy': path.resolve(__dirname, './services/tenancy/src/index.ts'),
      '@shivi/service-authorization': path.resolve(__dirname, './services/authorization/src/index.ts'),
      '@shivi/service-policy': path.resolve(__dirname, './services/policy/src/index.ts'),
      '@shivi/service-memory': path.resolve(__dirname, './services/memory/src/index.ts'),
      '@shivi/service-workflows': path.resolve(__dirname, './services/workflows/src/index.ts'),
      '@shivi/service-tools': path.resolve(__dirname, './services/tools/src/index.ts'),
      '@shivi/service-rag': path.resolve(__dirname, './services/rag/src/index.ts'),
      '@shivi/service-agents': path.resolve(__dirname, './services/agents/src/index.ts'),
      '@shivi/service-mcp': path.resolve(__dirname, './services/mcp/src/index.ts'),
      '@shivi/service-a2a': path.resolve(__dirname, './services/a2a/src/index.ts'),
      '@shivi/service-crm': path.resolve(__dirname, './services/crm/src/index.ts'),
      '@shivi/service-sales': path.resolve(__dirname, './services/sales/src/index.ts'),
      '@shivi/service-marketing': path.resolve(__dirname, './services/marketing/src/index.ts'),
      '@shivi/service-customer-success': path.resolve(__dirname, './services/customer-success/src/index.ts'),
      '@shivi/service-finance': path.resolve(__dirname, './services/finance/src/index.ts'),
      '@shivi/service-billing': path.resolve(__dirname, './services/billing/src/index.ts'),
      '@shivi/service-procurement': path.resolve(__dirname, './services/procurement/src/index.ts'),
      '@shivi/service-revops': path.resolve(__dirname, './services/revops/src/index.ts'),
      '@shivi/service-gtm': path.resolve(__dirname, './services/gtm/src/index.ts'),
      '@shivi/service-support': path.resolve(__dirname, './services/support/src/index.ts'),
      '@shivi/service-search': path.resolve(__dirname, './services/search/src/index.ts'),
      '@shivi/service-analytics': path.resolve(__dirname, './services/analytics/src/index.ts'),
      '@shivi/service-observability': path.resolve(__dirname, './services/observability/src/index.ts'),
      '@shivi/service-audit': path.resolve(__dirname, './services/audit/src/index.ts'),
      '@shivi/service-notifications': path.resolve(__dirname, './services/notifications/src/index.ts'),
      '@shivi/service-itops': path.resolve(__dirname, './services/itops/src/index.ts'),

      // Background Workers
      '@shivi/worker-agent': path.resolve(__dirname, './workers/agent-worker/src/index.ts'),
      '@shivi/worker-event': path.resolve(__dirname, './workers/event-worker/src/index.ts'),
      '@shivi/worker-scheduled': path.resolve(__dirname, './workers/scheduled-worker/src/index.ts'),
      '@shivi/worker-ingestion': path.resolve(__dirname, './workers/ingestion-worker/src/index.ts'),
      '@shivi/worker-analytics': path.resolve(__dirname, './workers/analytics-worker/src/index.ts'),
      '@shivi/worker-notification': path.resolve(__dirname, './workers/notification-worker/src/index.ts'),

      // Frontend Packages
      '@shivi/agent-ui': path.resolve(__dirname, './frontend/packages/agent-ui/src/index.ts'),
      '@shivi/api-client': path.resolve(__dirname, './frontend/packages/api-client/src/index.ts'),
      '@shivi/auth-client': path.resolve(__dirname, './frontend/packages/auth-client/src/index.ts'),
      '@shivi/charts': path.resolve(__dirname, './frontend/packages/charts/src/index.ts'),
      '@shivi/design-system': path.resolve(__dirname, './frontend/packages/design-system/src/index.ts'),
      '@shivi/feature-flags': path.resolve(__dirname, './frontend/packages/feature-flags/src/index.ts'),
      '@shivi/icons': path.resolve(__dirname, './frontend/packages/icons/src/index.ts'),
      '@shivi/state': path.resolve(__dirname, './frontend/packages/state/src/index.ts'),
      '@shivi/tables': path.resolve(__dirname, './frontend/packages/tables/src/index.ts'),
      '@shivi/telemetry-client': path.resolve(__dirname, './frontend/packages/telemetry-client/src/index.ts'),
      '@shivi/ui-components': path.resolve(__dirname, './frontend/packages/ui/src/index.ts'),
      '@shivi/validation': path.resolve(__dirname, './frontend/packages/validation/src/index.ts'),

      // Frontend Apps
      '@shivi/app-admin': path.resolve(__dirname, './frontend/apps/admin/src/index.ts'),
      '@shivi/app-ai-studio': path.resolve(__dirname, './frontend/apps/ai-studio/src/index.ts'),
      '@shivi/app-analytics': path.resolve(__dirname, './frontend/apps/analytics/src/index.ts'),
      '@shivi/app-developer-portal': path.resolve(__dirname, './frontend/apps/developer-portal/src/index.ts'),
      '@shivi/app-marketplace': path.resolve(__dirname, './frontend/apps/marketplace/src/index.ts'),
      '@shivi/app-web': path.resolve(__dirname, './frontend/apps/web/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
