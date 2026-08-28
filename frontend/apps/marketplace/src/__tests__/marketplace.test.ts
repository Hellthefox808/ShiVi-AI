import { describe, it, expect } from 'vitest';
import { MarketplaceApp } from '../index.js';

describe('Marketplace App Suite', () => {
  it('should initialize MarketplaceApp successfully', () => {
    const app = new MarketplaceApp({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
