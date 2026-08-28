import { describe, it, expect } from 'vitest';
import { DeveloperPortalApp } from '../index.js';

describe('Developer Portal App Suite', () => {
  it('should initialize DeveloperPortalApp successfully', () => {
    const app = new DeveloperPortalApp({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
