import { describe, it, expect } from 'vitest';
import { ShiViWebApp } from '../index.js';

describe('Web Main App Suite', () => {
  it('should initialize ShiViWebApp successfully', () => {
    const app = new ShiViWebApp({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
