/**
 * ShiVi X100+ Resilience — System Degradation Manager & Circuit Breaker
 * Standard: SAD v2.0 §46, TDA v1.1 §96
 */

export type OperationalMode = 'NORMAL' | 'DEGRADED' | 'READ_ONLY' | 'EMERGENCY_STOP';

export interface ComponentHealth {
  componentName: string;
  healthy: boolean;
  consecutiveFailures: number;
  lastFailureTime?: number;
}

export class SystemDegradationManager {
  private static currentMode: OperationalMode = 'NORMAL';
  private static components = new Map<string, ComponentHealth>();
  private static FAILURE_THRESHOLD = 3;

  public static getOperationalMode(): OperationalMode {
    return this.currentMode;
  }

  public static setOperationalMode(mode: OperationalMode, reason?: string): void {
    this.currentMode = mode;
  }

  /**
   * Record component status check (trips circuit breaker to DEGRADED or READ_ONLY on failure threshold)
   */
  public static reportComponentHealth(componentName: string, healthy: boolean): ComponentHealth {
    let health = this.components.get(componentName);
    if (!health) {
      health = { componentName, healthy: true, consecutiveFailures: 0 };
    }

    if (healthy) {
      health.healthy = true;
      health.consecutiveFailures = 0;
    } else {
      health.healthy = false;
      health.consecutiveFailures++;
      health.lastFailureTime = Date.now();

      // Trip operational mode if threshold exceeded
      if (health.consecutiveFailures >= this.FAILURE_THRESHOLD) {
        if (componentName === 'database' || componentName === 'evidence-ledger') {
          this.setOperationalMode('READ_ONLY', `Critical component '${componentName}' failed ${health.consecutiveFailures} times.`);
        } else {
          this.setOperationalMode('DEGRADED', `Component '${componentName}' failed ${health.consecutiveFailures} times.`);
        }
      }
    }

    this.components.set(componentName, health);
    return health;
  }
}
