export interface RAGQuery { query: string; topK: number; filters: Record<string, unknown>; }
export class RAGService { retrieve(q: RAGQuery): { chunks: unknown[]; scores: number[] } { return { chunks: [], scores: [] }; } }
