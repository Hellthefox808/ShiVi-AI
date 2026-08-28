import { describe, it, expect } from 'vitest';
import { NotificationService } from '../index.js';

describe('NotificationService Platform Suite', () => {
  const service = new NotificationService();

  it('should dispatch multi-channel alert notification', async () => {
    const res = await service.sendAlert({
      tenantId: 'tenant_notif',
      recipient: 'devops@shivi.ai',
      channel: 'slack',
      severity: 'high',
      title: 'P0 Spike in LLM Latency',
      message: 'Claude Sonnet 3.5 p99 latency exceeded 2000ms',
    });
    expect(res.delivered).toBe(true);
    expect(res.notificationId).toBeDefined();
  });

  it('should register webhook subscription', async () => {
    const hook = await service.registerWebhook({
      tenantId: 'tenant_notif',
      url: 'https://webhook.site/shivi-events',
      eventTypes: ['agent:quarantined', 'security:tamper_detected'],
    });
    expect(hook.webhookId).toBeDefined();
  });
});
