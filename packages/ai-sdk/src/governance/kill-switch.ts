/**
 * ShiVi AI Governance Fabric — Kill Switch & Safe Mode Controller
 * Provides emergency controls to disable agents, tools, workflows,
 * models, integrations, or activate global safe mode.
 */

export type KillSwitchTarget =
  | 'AGENT'
  | 'TOOL'
  | 'WORKFLOW'
  | 'MODEL'
  | 'INTEGRATION'
  | 'GLOBAL';

export type SafeModeLevel = 'NORMAL' | 'READ_ONLY' | 'SAFE_MODE' | 'LOCKDOWN';

export interface KillSwitchRecord {
  id: string;
  tenantId: string;
  targetType: KillSwitchTarget;
  targetId: string;
  enabled: boolean;
  reason: string;
  activatedBy: string;
  activatedAt: number;
  deactivatedBy?: string;
  deactivatedAt?: number;
}

export type OperationType =
  | 'READ'
  | 'ANALYZE'
  | 'RECOMMEND'
  | 'WRITE'
  | 'DELETE'
  | 'SEND'
  | 'PUBLISH'
  | 'CHANGE_PERMISSIONS';

export class KillSwitchController {
  private static records = new Map<string, KillSwitchRecord>();
  private static safeModes = new Map<string, SafeModeLevel>();

  public static activate(
    tenantId: string,
    targetType: KillSwitchTarget,
    targetId: string,
    reason: string,
    activatedBy: string
  ): KillSwitchRecord {
    const id = `${tenantId}:${targetType}:${targetId}`;
    const record: KillSwitchRecord = {
      id,
      tenantId,
      targetType,
      targetId,
      enabled: true,
      reason,
      activatedBy,
      activatedAt: Date.now(),
    };
    this.records.set(id, record);
    return record;
  }

  public static deactivate(
    tenantId: string,
    targetType: KillSwitchTarget,
    targetId: string,
    deactivatedBy: string
  ): KillSwitchRecord {
    const id = `${tenantId}:${targetType}:${targetId}`;
    const record = this.records.get(id);
    if (!record) {
      throw new Error('Kill switch record not found');
    }
    record.enabled = false;
    record.deactivatedBy = deactivatedBy;
    record.deactivatedAt = Date.now();
    return record;
  }

  public static isActive(tenantId: string, targetType: KillSwitchTarget, targetId: string): boolean {
    const id = `${tenantId}:${targetType}:${targetId}`;
    return this.records.get(id)?.enabled ?? false;
  }

  public static setSafeMode(
    tenantId: string,
    level: SafeModeLevel,
    reason: string,
    activatedBy: string
  ): void {
    this.safeModes.set(tenantId, level);
    // In a real system, you'd audit log this action with `reason` and `activatedBy`
  }

  public static getSafeMode(tenantId: string): SafeModeLevel {
    return this.safeModes.get(tenantId) ?? 'NORMAL';
  }

  public static isOperationAllowed(
    tenantId: string,
    operationType: OperationType,
    targetType?: KillSwitchTarget,
    targetId?: string
  ): { allowed: boolean; reason: string } {
    if (targetType && targetId) {
      if (this.isActive(tenantId, targetType, targetId)) {
        return { allowed: false, reason: `Target ${targetType} ${targetId} has an active kill switch.` };
      }
    }

    if (this.isActive(tenantId, 'GLOBAL', 'GLOBAL')) {
      return { allowed: false, reason: 'GLOBAL kill switch is active.' };
    }

    const mode = this.getSafeMode(tenantId);
    
    if (mode === 'LOCKDOWN') {
      return { allowed: false, reason: 'Safe mode is set to LOCKDOWN.' };
    }
    
    if (mode === 'SAFE_MODE') {
      const allowedInSafe = ['READ', 'ANALYZE', 'RECOMMEND'];
      if (!allowedInSafe.includes(operationType)) {
        return { allowed: false, reason: `Operation ${operationType} not allowed in SAFE_MODE.` };
      }
    }
    
    if (mode === 'READ_ONLY') {
      if (operationType !== 'READ') {
        return { allowed: false, reason: `Operation ${operationType} not allowed in READ_ONLY mode.` };
      }
    }

    return { allowed: true, reason: 'Operation allowed.' };
  }

  public static getActiveKillSwitches(tenantId: string): KillSwitchRecord[] {
    const active: KillSwitchRecord[] = [];
    for (const record of this.records.values()) {
      if (record.tenantId === tenantId && record.enabled) {
        active.push(record);
      }
    }
    return active;
  }

  public static getKillSwitchHistory(tenantId: string): KillSwitchRecord[] {
    const history: KillSwitchRecord[] = [];
    for (const record of this.records.values()) {
      if (record.tenantId === tenantId) {
        history.push(record);
      }
    }
    return history;
  }

  public static resetStore(): void {
    this.records.clear();
    this.safeModes.clear();
  }
}
