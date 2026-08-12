export interface IngestionJob { sourceUrl: string; format: string; tenantId: string; }
export class IngestionWorker { async process(job: IngestionJob): Promise<{ chunksCreated: number }> { return { chunksCreated: 0 }; } }
