/**
 * worker-event - CloudEvents stream processing worker
 *
 * @packageDocumentation
 */

export interface EventPayload {
  id: string;
  type: string;
  source: string;
  data: unknown;
  time: string;
}

export class EventWorker {
  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async processEvent(event: EventPayload): Promise<{ processed: boolean; eventId: string }> {
    return {
      processed: true,
      eventId: event.id,
    };
  }
}

export default EventWorker;
