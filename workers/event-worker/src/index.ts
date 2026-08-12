export interface EventBatch { events: unknown[]; source: string; }
export class EventWorker { async process(batch: EventBatch): Promise<{ processed: number }> { return { processed: batch.events.length }; } }
