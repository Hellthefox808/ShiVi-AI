import { describe, it, expect } from 'vitest';
import { AIStudioApp } from '../index.js';

describe('AI Studio App Suite', () => {
  it('should initialize AIStudioApp successfully', () => {
    const app = new AIStudioApp({ basePath: '/' } as any);
    expect(app).toBeDefined();
  });
});
