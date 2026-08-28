import { describe, it, expect } from 'vitest';
import { AnalyticsDashboard } from '../index.js';

describe('Analytics Dashboard App Suite', () => {
  it('should initialize AnalyticsDashboard successfully', () => {
    const app = new AnalyticsDashboard({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
