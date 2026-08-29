/**
 * ShiVi X100+ Database & Cache — Redis Distributed Cache, Pub/Sub & Rate Limiting Adapter
 * Standard: SAD v2.0 §18, TDA v1.1 §82
 */

import { Redis } from 'ioredis';

export interface RedisOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  connectionString?: string;
}

export class RedisClientAdapter {
  private static client: Redis | null = null;
  private static subClient: Redis | null = null;
  public static isConnected = false;

  public static async connect(config?: RedisOptions): Promise<boolean> {
    if (this.client) return true;
    
    const url = process.env.REDIS_URL || config?.connectionString || 'redis://localhost:6379/0';
    this.client = new Redis(url);
    this.subClient = new Redis(url);

    return new Promise((resolve) => {
      this.client!.on('ready', () => {
        this.isConnected = true;
        resolve(true);
      });
      this.client!.on('error', (err) => {
        console.error('ShiVi Redis Error:', err);
        resolve(false);
      });
    });
  }

  /**
   * Tenant-scoped Cache Set with optional TTL in seconds
   */
  public static async set(tenantId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) await this.connect();
    const scopedKey = `tenant:${tenantId}:${key}`;
    
    if (ttlSeconds) {
      await this.client!.set(scopedKey, value, 'EX', ttlSeconds);
    } else {
      await this.client!.set(scopedKey, value);
    }
  }

  /**
   * Tenant-scoped Cache Get
   */
  public static async get(tenantId: string, key: string): Promise<string | null> {
    if (!this.client) await this.connect();
    const scopedKey = `tenant:${tenantId}:${key}`;
    return this.client!.get(scopedKey);
  }

  /**
   * Acquire Redlock-style distributed lock with TTL
   */
  public static async acquireLock(lockKey: string, ttlMs: number = 5000): Promise<boolean> {
    if (!this.client) await this.connect();
    const now = Date.now().toString();
    const result = await this.client!.set(`lock:${lockKey}`, now, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  /**
   * Release distributed lock
   */
  public static async releaseLock(lockKey: string): Promise<void> {
    if (!this.client) await this.connect();
    await this.client!.del(`lock:${lockKey}`);
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
    if (!this.client) await this.connect();
    
    const key = `ratelimit:${tenantId}:${identifier}`;
    
    // Simple fixed window rate limit via multi
    const multi = this.client!.multi();
    multi.incr(key);
    multi.pttl(key);
    const results = await multi.exec();
    
    if (!results) {
      return { allowed: false, remaining: 0, resetTimeMs: Date.now() + windowSeconds * 1000 };
    }

    const count = results[0][1] as number;
    let ttl = results[1][1] as number;
    
    if (ttl < 0) {
      await this.client!.expire(key, windowSeconds);
      ttl = windowSeconds * 1000;
    }

    const resetTimeMs = Date.now() + ttl;

    if (count > maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs,
      };
    }

    return {
      allowed: true,
      remaining: maxRequests - count,
      resetTimeMs,
    };
  }

  /**
   * Pub/Sub Event Broadcast
   */
  public static async publish(channel: string, message: string): Promise<number> {
    if (!this.client) await this.connect();
    return this.client!.publish(channel, message);
  }

  /**
   * Pub/Sub Event Subscriber
   */
  public static async subscribe(channel: string, listener: (message: string) => void): Promise<void> {
    if (!this.subClient) await this.connect();
    
    await this.subClient!.subscribe(channel);
    this.subClient!.on('message', (chan, msg) => {
      if (chan === channel) {
        listener(msg);
      }
    });
  }

  /**
   * Clear cache (for testing / maintenance)
   */
  public static async resetStore(): Promise<void> {
    if (this.client) {
      await this.client.flushdb();
    }
  }
}
