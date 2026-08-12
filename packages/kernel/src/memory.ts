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
  private static memoryStore = new Map<string, AgentMemoryItem>();

  /**
   * Write an item to agent memory with tenant isolation enforcement
   */
  public static storeMemory(item: Omit<AgentMemoryItem, 'createdAt' | 'updatedAt' | 'verificationState'>): AgentMemoryItem {
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

    this.memoryStore.set(id, memoryItem);
    return memoryItem;
  }

  /**
   * Retrieve memory items for an agent within a tenant boundary
   */
  public static queryMemory(
    requestTenantId: string,
    agentId: string,
    tier?: MemoryTier,
    filterKey?: string
  ): AgentMemoryItem[] {
    const results: AgentMemoryItem[] = [];
    const now = Date.now();

    for (const item of this.memoryStore.values()) {
      if (item.tenantId !== requestTenantId) {
        continue;
      }
      if (item.agentId !== agentId) {
        continue;
      }
      if (tier && item.tier !== tier) {
        continue;
      }
      if (filterKey && !item.key.includes(filterKey)) {
        continue;
      }
      if (item.expiresAt && item.expiresAt <= now) {
        continue; // Expired memory
      }
      results.push(item);
    }

    return results;
  }

  /**
   * Assert tenant isolation for direct memory access
   */
  public static getMemoryById(requestTenantId: string, memoryId: string): AgentMemoryItem | undefined {
    const item = this.memoryStore.get(memoryId);
    if (!item) return undefined;

    if (item.tenantId !== requestTenantId) {
      throw new MemoryIsolationViolationError(requestTenantId, item.tenantId);
    }
    return item;
  }

  /**
   * Detect contradictory memories for the same key within a tenant
   */
  public static detectMemoryConflicts(requestTenantId: string, agentId: string, key: string): AgentMemoryItem[] {
    const items = this.queryMemory(requestTenantId, agentId, undefined, key);
    if (items.length <= 1) return [];

    // Flag conflicts if content hashes or values differ
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
  public static clearWorkingMemory(requestTenantId: string, agentId: string): number {
    let clearedCount = 0;
    for (const [id, item] of this.memoryStore.entries()) {
      if (item.tenantId === requestTenantId && item.agentId === agentId && item.tier === 'WORKING') {
        this.memoryStore.delete(id);
        clearedCount++;
      }
    }
    return clearedCount;
  }

  /**
   * Reset store (testing only)
   */
  public static resetStore(): void {
    this.memoryStore.clear();
  }
}
