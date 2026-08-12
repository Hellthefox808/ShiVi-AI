/**
 * ShiVi X100+ Kernel — Event Backbone Primitives
 * Standard: SAD v2.0 §27, TDA v1.1 §27, FTL-KER-005
 */

export interface CloudEventEnvelope<T = unknown> {
  id: string; // Globally unique ID
  source: string; // e.g. "shivi/agent-runtime"
  specversion: '1.0';
  type: string; // e.g. "shivi.agent.executed"
  datacontenttype: 'application/json';
  tenantId: string;
  correlationId: string;
  causationId?: string;
  time: string; // ISO 8601 string
  data: T;
  traceId?: string;
}

export type EventHandler<T = unknown> = (event: CloudEventEnvelope<T>) => Promise<void>;

export class EventBus {
  private static subscribers = new Map<string, EventHandler[]>();
  private static processedEventIds = new Set<string>();

  /**
   * Publish a CloudEvent envelope
   */
  public static async publish<T>(event: CloudEventEnvelope<T>): Promise<void> {
    if (!event.id || !event.tenantId || !event.type) {
      throw new Error('Event publishing failed: id, tenantId, and type are required.');
    }

    // Deduplication check
    if (this.processedEventIds.has(event.id)) {
      return; // Deduplicated
    }
    this.processedEventIds.add(event.id);

    const handlers = this.subscribers.get(event.type) || [];
    for (const handler of handlers) {
      try {
        await handler(event as CloudEventEnvelope<unknown>);
      } catch (err) {
        // Log event dispatch failure for DLQ handling
        console.error(`[EventBus] Error dispatching event ${event.id} to handler:`, err);
      }
    }
  }

  /**
   * Subscribe to event type
   */
  public static subscribe<T>(eventType: string, handler: EventHandler<T>): void {
    const handlers = this.subscribers.get(eventType) || [];
    handlers.push(handler as EventHandler<unknown>);
    this.subscribers.set(eventType, handlers);
  }

  /**
   * Create CloudEvent envelope helper
   */
  public static createEnvelope<T>(
    source: string,
    type: string,
    tenantId: string,
    data: T,
    correlationId: string = `corr_${Math.random().toString(36).substring(2, 9)}`,
    causationId?: string
  ): CloudEventEnvelope<T> {
    return {
      id: `evt_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`,
      source,
      specversion: '1.0',
      type,
      datacontenttype: 'application/json',
      tenantId,
      correlationId,
      causationId,
      time: new Date().toISOString(),
      data,
    };
  }
}
