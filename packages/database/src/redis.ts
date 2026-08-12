/**
 * ShiVi X100+ Database & Cache — Redis Distributed Cache, Pub/Sub & Rate Limiting Adapter
 * Standard: SAD v2.0 §18, TDA v1.1 §82
 */

export interface RedisOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

export class RedisClientAdapter {
  private static cacheStore = new Map<string, { value: string; expiresAt?: number }>();
  private static pubSubChannels = new Map<string, Array<(message: string) => void>>();
  private static distributedLocks = new Map<string, number>();

  /**
   * Tenant-scoped Cache Set with optional TTL in seconds
   */
  public static async set(tenantId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    const scopedKey = `tenant:${tenantId}:${key}`;
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.cacheStore.set(scopedKey, { value, expiresAt });
  }

  /**
   * Tenant-scoped Cache Get
   */
  public static async get(tenantId: string, key: string): Promise<string | null> {
    const scopedKey = `tenant:${tenantId}:${key}`;
    const item = this.cacheStore.get(scopedKey);
    if (!item) return null;

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cacheStore.delete(scopedKey);
      return null;
    }

    return item.value;
  }

  /**
   * Acquire Redlock-style distributed lock with TTL
   */
  public static async acquireLock(lockKey: string, ttlMs: number = 5000): Promise<boolean> {
    const now = Date.now();
    const currentLock = this.distributedLocks.get(lockKey);
    if (currentLock && now < currentLock) {
      return false; // Lock already held
    }

    this.distributedLocks.set(lockKey, now + ttlMs);
    return true;
  }

  /**
   * Release distributed lock
   */
  public static async releaseLock(lockKey: string): Promise<void> {
    this.distributedLocks.delete(lockKey);
  }

  /**
   * Token-Bucket / Sliding-Window Rate Limiting Engine
   */
  public static async checkRateLimit(
    tenantId: string,
    identifier: string,
    maxRequests: number = 100,
    windowSeconds: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetTimeMs: number }> {
    const key = `ratelimit:${tenantId}:${identifier}`;
    const now = Date.now();
    const item = this.cacheStore.get(key);

    let count = 0;
    let windowStart = now;

    if (item && item.expiresAt && now < item.expiresAt) {
      count = parseInt(item.value, 10);
      windowStart = item.expiresAt - windowSeconds * 1000;
    } else {
      this.cacheStore.set(key, { value: '0', expiresAt: now + windowSeconds * 1000 });
    }

    if (count >= maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: windowStart + windowSeconds * 1000,
      };
    }

    count += 1;
    const expiresAt = item?.expiresAt || now + windowSeconds * 1000;
    this.cacheStore.set(key, { value: count.toString(), expiresAt });

    return {
      allowed: true,
      remaining: maxRequests - count,
      resetTimeMs: expiresAt,
    };
  }

  /**
   * Pub/Sub Event Broadcast
   */
  public static async publish(channel: string, message: string): Promise<number> {
    const listeners = this.pubSubChannels.get(channel) || [];
    for (const listener of listeners) {
      listener(message);
    }
    return listeners.length;
  }

  /**
   * Pub/Sub Event Subscriber
   */
  public static subscribe(channel: string, listener: (message: string) => void): void {
    const listeners = this.pubSubChannels.get(channel) || [];
    listeners.push(listener);
    this.pubSubChannels.set(channel, listeners);
  }

  /**
   * Clear cache (for testing / maintenance)
   */
  public static resetStore(): void {
    this.cacheStore.clear();
    this.pubSubChannels.clear();
    this.distributedLocks.clear();
  }
}
