import { describe, it, expect } from 'vitest';
import {
  ShiViTracer,
  MultiRegionDRManager,
  createDefaultTracingConfig,
  SpanStatusCode,
  SpanKind,
  DRFailoverState,
  ShiViSemanticConventions,
} from '../tracing.js';

describe('ShiVi OpenTelemetry Distributed Tracing', () => {
  const config = createDefaultTracingConfig('test-service', 'test');
  const tracer = new ShiViTracer(config);

  it('should create a root span with correct attributes', () => {
    const span = tracer.startTrace('test-operation', {
      [ShiViSemanticConventions.TENANT_ID]: 'tenant-001',
    });
    expect(span.traceId).toHaveLength(32);
    expect(span.spanId).toHaveLength(16);
    expect(span.name).toBe('test-operation');
    expect(span.kind).toBe(SpanKind.SERVER);
    expect(span.attributes['shivi.tenant.id']).toBe('tenant-001');
    tracer.endSpan(span.spanId);
  });

  it('should create child spans with parent context', () => {
    const root = tracer.startTrace('parent-op');
    const ctx = tracer.extractContext(root);
    const child = tracer.startSpan('child-op', ctx, SpanKind.CLIENT);
    expect(child.traceId).toBe(root.traceId);
    expect(child.parentSpanId).toBe(root.spanId);
    tracer.endSpan(child.spanId);
    tracer.endSpan(root.spanId);
  });

  it('should format and parse W3C traceparent headers', () => {
    const root = tracer.startTrace('traceparent-test');
    const ctx = tracer.extractContext(root);
    const header = tracer.formatTraceparent(ctx);
    expect(header).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
    const parsed = tracer.parseTraceparent(header);
    expect(parsed?.traceId).toBe(ctx.traceId);
    expect(parsed?.spanId).toBe(ctx.spanId);
    tracer.endSpan(root.spanId);
  });

  it('should add events to spans', () => {
    const span = tracer.startTrace('event-test');
    tracer.addEvent(span.spanId, 'model.invocation.start', {
      [ShiViSemanticConventions.MODEL_PROVIDER]: 'gemini',
    });
    expect(span.events).toHaveLength(1);
    expect(span.events[0].name).toBe('model.invocation.start');
    tracer.endSpan(span.spanId);
  });

  it('should create default tracing config with correct sampling', () => {
    const prodConfig = createDefaultTracingConfig('prod-svc', 'production');
    expect(prodConfig.sampling.ratio).toBe(0.1);
    expect(prodConfig.sampling.alwaysSampleErrors).toBe(true);
    const devConfig = createDefaultTracingConfig('dev-svc', 'development');
    expect(devConfig.sampling.ratio).toBe(1.0);
  });
});

describe('ShiVi Multi-Region DR Failover Manager', () => {
  const regions = [
    { regionId: 'us-central1', endpoint: 'https://api-primary.shivi.io', isPrimary: true, healthCheckUrl: '/health', weight: 100 },
    { regionId: 'us-east1', endpoint: 'https://api-dr.shivi.io', isPrimary: false, healthCheckUrl: '/health', weight: 0 },
  ];

  it('should initialize in NORMAL state', () => {
    const dr = new MultiRegionDRManager(regions, 30, 120);
    expect(dr.getState()).toBe(DRFailoverState.NORMAL);
    expect(dr.getPrimaryRegion()?.regionId).toBe('us-central1');
    expect(dr.getDRRegions()).toHaveLength(1);
  });

  it('should execute failover and failback lifecycle', () => {
    const dr = new MultiRegionDRManager(regions, 30, 120);

    const failoverEvent = dr.initiateFailover('health_check_failure');
    expect(dr.getState()).toBe(DRFailoverState.FAILED_OVER);
    expect(failoverEvent.fromRegion).toBe('us-central1');
    expect(failoverEvent.toRegion).toBe('us-east1');

    const failbackEvent = dr.initiateFailback();
    expect(dr.getState()).toBe(DRFailoverState.NORMAL);
    expect(failbackEvent.fromRegion).toBe('us-east1');
    expect(failbackEvent.toRegion).toBe('us-central1');

    expect(dr.getFailoverHistory()).toHaveLength(2);
  });

  it('should produce a DR health report', () => {
    const dr = new MultiRegionDRManager(regions, 30, 120);
    const report = dr.getDRHealthReport();
    expect(report.primaryRegion).toBe('us-central1');
    expect(report.drRegions).toContain('us-east1');
    expect(report.rpoTargetSeconds).toBe(30);
    expect(report.rtoTargetSeconds).toBe(120);
    expect(report.replicationHealthy).toBe(true);
  });
});
