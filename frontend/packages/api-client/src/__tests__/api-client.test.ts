import { describe, it, expect } from 'vitest';
import { ShiViApiClient } from '../index.js';

describe('ShiVi Frontend API Client Suite', () => {
  const client = new ShiViApiClient({
    baseUrl: 'https://api.shivi.ai',
    apiKey: 'shivi_live_key',
    timeout: 5000,
    retries: 3,
  });

  it('should perform GET requests returning typed responses', async () => {
    const res = await client.get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.data).toBeDefined();
  });

  it('should perform POST requests with payload', async () => {
    const res = await client.post('/api/v1/agents/execute', { agentId: 'agent_1' });
    expect(res.status).toBe(201);
  });
});
