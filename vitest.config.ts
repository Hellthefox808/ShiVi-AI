import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
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
      '@shivi/app-kernel-api': path.resolve(__dirname, './apps/kernel-api/src/index.ts'),
      '@shivi/app-command-center': path.resolve(__dirname, './apps/command-center/src/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
