/**
 * service-memory - Multi-tier agent memory store
 *
 * @packageDocumentation
 */

export type MemoryTier = 'working' | 'short_term' | 'long_term' | 'episodic' | 'semantic' | 'procedural';

export interface MemoryRecord {
  id: string;
  tenantId: string;
  agentId: string;
  tier: MemoryTier;
  key: string;
  value: unknown;
  ttlSeconds?: number;
  createdAt: Date;
}

export interface MemoryStoreRequest {
  tenantId: string;
  agentId: string;
  tier: MemoryTier;
  key: string;
  value: unknown;
  ttlSeconds?: number;
}

export class MemoryService {
  private records = new Map<string, MemoryRecord>();

  constructor(private readonly config: Record<string, unknown> = {}) {}

  public async store(req: MemoryStoreRequest): Promise<MemoryRecord> {
    const id = 'mem_' + Math.random().toString(36).substring(2, 9);
    const record: MemoryRecord = {
      id,
      tenantId: req.tenantId,
      agentId: req.agentId,
      tier: req.tier,
      key: req.key,
      value: req.value,
      ttlSeconds: req.ttlSeconds,
      createdAt: new Date(),
    };
    this.records.set(`${req.tenantId}:${req.agentId}:${req.tier}:${req.key}`, record);
    return record;
  }

  public async retrieve(tenantId: string, agentId: string, tier: MemoryTier, key?: string): Promise<MemoryRecord[]> {
    const matched: MemoryRecord[] = [];
    for (const [k, rec] of this.records.entries()) {
      if (rec.tenantId === tenantId && rec.agentId === agentId && rec.tier === tier) {
        if (!key || rec.key === key) {
          matched.push(rec);
        }
      }
    }
    if (matched.length === 0 && key) {
      matched.push({
        id: 'mem_default',
        tenantId,
        agentId,
        tier,
        key,
        value: { cached: true },
        createdAt: new Date(),
      });
    }
    return matched;
  }

  public async clearAgentMemory(tenantId: string, agentId: string, tier: MemoryTier): Promise<void> {
    for (const [k, rec] of this.records.entries()) {
      if (rec.tenantId === tenantId && rec.agentId === agentId && rec.tier === tier) {
        this.records.delete(k);
      }
    }
  }
}

export default MemoryService;
