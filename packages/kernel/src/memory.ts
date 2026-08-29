/**
 * ShiVi X100+ Kernel — Unified Agent Memory Primitives
 * Standard: SAD v2.0 §11, TDA v1.1 §11, FTL-KER-005
 */

import { TenancyManager } from './tenancy.js';

export type MemoryTier = 'WORKING' | 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL';

export interface MemoryProvenance {
  sourceId: string;
  sourceType: 'USER_INPUT' | 'TOOL_RESULT' | 'AGENT_REASONING' | 'SYSTEM_EVENT';
  timestamp: number;
  hash: string;
}

export interface AgentMemoryItem {
  id: string;
  tenantId: string;
  agentId: string;
  tier: MemoryTier;
  key: string;
  content: Record<string, unknown> | string;
  confidence: number; // 0.0 to 1.0
  provenance: MemoryProvenance;
  classification: 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  verificationState: 'UNVERIFIED' | 'VERIFIED' | 'CONTRADICTED';
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export class MemoryIsolationViolationError extends Error {
  constructor(sourceTenantId: string, targetTenantId: string) {
    super(`Cross-tenant memory violation: Tenant '${sourceTenantId}' attempted memory operation on Tenant '${targetTenantId}'`);
    this.name = 'MemoryIsolationViolationError';
  }
}

export class AgentMemoryEngine {
  /**
   * Write an item to agent memory with tenant isolation enforcement
   */
  public static async storeMemory(item: Omit<AgentMemoryItem, 'createdAt' | 'updatedAt' | 'verificationState'>): Promise<AgentMemoryItem> {
    if (!item.tenantId || !item.agentId || !item.key) {
      throw new Error('Memory store failed: tenantId, agentId, and key are required.');
    }

    const now = Date.now();
    const id = item.id ?? `mem_${item.tier.toLowerCase()}_${Math.random().toString(36).substring(2, 11)}_${now}`;

    const memoryItem: AgentMemoryItem = {
      ...item,
      id,
      verificationState: 'VERIFIED',
      createdAt: now,
      updatedAt: now,
    };

    const { RedisClientAdapter } = await import('@shivi/database');
    const redisKey = `agent:${item.agentId}:${id}`;
    
    // Store main record
    await RedisClientAdapter.set(item.tenantId, redisKey, JSON.stringify(memoryItem));
    
    // Maintain an index set for the agent's memories
    const indexKey = `memory_index:${item.agentId}`;
    
    // For simplicity with basic ioredis wrapper, we can fetch index, append, and save
    let indexStr = await RedisClientAdapter.get(item.tenantId, indexKey);
    let indexArr: string[] = indexStr ? JSON.parse(indexStr) : [];
    indexArr.push(redisKey);
    await RedisClientAdapter.set(item.tenantId, indexKey, JSON.stringify(indexArr));

    return memoryItem;
  }

  /**
   * Retrieve memory items for an agent within a tenant boundary
   */
  public static async queryMemory(
    requestTenantId: string,
    agentId: string,
    tier?: MemoryTier,
    filterKey?: string
  ): Promise<AgentMemoryItem[]> {
    const results: AgentMemoryItem[] = [];
    const now = Date.now();
    
    const { RedisClientAdapter } = await import('@shivi/database');
    const indexKey = `memory_index:${agentId}`;
    let indexStr = await RedisClientAdapter.get(requestTenantId, indexKey);
    if (!indexStr) return [];
    
    const keys: string[] = JSON.parse(indexStr);
    
    for (const key of keys) {
      const memStr = await RedisClientAdapter.get(requestTenantId, key);
      if (!memStr) continue;
      
      const item: AgentMemoryItem = JSON.parse(memStr);
      if (tier && item.tier !== tier) continue;
      if (filterKey && !item.key.includes(filterKey)) continue;
      if (item.expiresAt && item.expiresAt <= now) continue;
      
      results.push(item);
    }

    return results;
  }

  /**
   * Assert tenant isolation for direct memory access
   */
  public static async getMemoryById(requestTenantId: string, memoryId: string): Promise<AgentMemoryItem | undefined> {
    // This requires scanning if we don't know the agent ID, or maintaining a global memory key pattern.
    // For now we'll throw unsupported as this is a theoretical implementation
    throw new Error('Direct getMemoryById requires agentId index in real implementation.');
  }

  /**
   * Detect contradictory memories for the same key within a tenant
   */
  public static async detectMemoryConflicts(requestTenantId: string, agentId: string, key: string): Promise<AgentMemoryItem[]> {
    const items = await this.queryMemory(requestTenantId, agentId, undefined, key);
    if (items.length <= 1) return [];

    const uniqueContents = new Set(items.map((i) => JSON.stringify(i.content)));
    if (uniqueContents.size > 1) {
      items.forEach((item) => {
        item.verificationState = 'CONTRADICTED';
      });
      return items;
    }
    return [];
  }

  /**
   * Clear working memory for an agent (reset session context)
   */
  public static async clearWorkingMemory(requestTenantId: string, agentId: string): Promise<number> {
    return 0; // Requires DEL commands on indexed keys
  }

  /**
   * Reset store (testing only)
   */
  public static resetStore(): void {
  }
}
