import { describe, it, expect } from 'vitest';
import { AdminApp } from '../index.js';

describe('Admin Dashboard App Suite', () => {
  it('should initialize AdminApp successfully', () => {
    const app = new AdminApp({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
