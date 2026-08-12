export interface MemoryEntry { key: string; value: unknown; ttlSeconds: number; }
export class MemoryService { store(entry: MemoryEntry): void {} recall(key: string): unknown { return null; } }
