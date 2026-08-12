/**
 * ShiVi X100+ Security — Sliding Window Rate Limiter Engine
 * Standard: SAD v2.0 §19, TDA v1.1 §88
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export class SlidingWindowRateLimiter {
  private static requestLog = new Map<string, number[]>();

  /**
   * Check sliding window rate limit per tenant and route
   */
  public static checkLimit(
    tenantId: string,
    route: string,
    maxRequests: number = 60,
    windowMs: number = 60000
  ): RateLimitResult {
    const key = `ratelimit:${tenantId}:${route}`;
    const now = Date.now();
    const timestamps = this.requestLog.get(key) || [];

    // Filter out timestamps outside window
    const validTimestamps = timestamps.filter((t) => now - t < windowMs);

    if (validTimestamps.length >= maxRequests) {
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetMs: validTimestamps[0] + windowMs,
      };
    }

    validTimestamps.push(now);
    this.requestLog.set(key, validTimestamps);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - validTimestamps.length,
      resetMs: now + windowMs,
    };
  }

  public static resetLimiter(): void {
    this.requestLog.clear();
  }
}
