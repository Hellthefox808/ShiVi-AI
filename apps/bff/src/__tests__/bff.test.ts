import { describe, it, expect } from 'vitest';
import { BFFService } from '../index.js';

describe('ShiVi BFF (Backend-for-Frontend) Aggregation Suite', () => {
  const bff = new BFFService({ cacheTTLMs: 5000 });

  it('should return aggregated dashboard data with active agents and revenue', async () => {
    const data = await bff.getDashboardData('tenant-bff-test', 'usr_admin_1');
    expect(data.tenantId).toBe('tenant-bff-test');
    expect(data.user.roles).toContain('admin');
    expect(data.metrics.activeAgents).toBeGreaterThan(0);
    expect(data.metrics.systemHealth).toBe('healthy');
    expect(data.recentActivities.length).toBeGreaterThan(0);
  });

  it('should compose client overview response correctly', async () => {
    const res = await bff.composeClientResponse(
      { path: '/api/v1/overview', method: 'GET' },
      {
        tenantId: 'tenant-bff-test',
        authorizationHeader: 'Bearer token-123',
        requestId: 'req-bff-01',
      }
    );
    expect(res.statusCode).toBe(200);
    const data = res.data as any;
    expect(data.permissions).toContain('read:dashboard');
    expect(data.profile.tenantId).toBe('tenant-bff-test');
  });

  it('should return 400 when tenantId is missing in context', async () => {
    const res = await bff.composeClientResponse(
      { path: '/api/v1/custom', method: 'GET' },
      {
        tenantId: '',
        authorizationHeader: 'Bearer token-123',
        requestId: 'req-bff-02',
      }
    );
    expect(res.statusCode).toBe(400);
  });

  it('should aggregate metrics across domains', async () => {
    const metrics = await bff.aggregateMetrics('tenant-bff-test');
    expect(metrics.tenantId).toBe('tenant-bff-test');
    expect((metrics.agents as any).active).toBe(14);
    expect((metrics.security as any).score).toBe(100);
  });
});
