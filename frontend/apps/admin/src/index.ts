/**
 * @shivi/app-admin
 * Admin Dashboard Application Configuration Types & Module Exports
 */

export interface UserManagementConfig {
  allowUserRegistration: boolean;
  requireEmailVerification: boolean;
  defaultUserRole: string;
  sessionMaxDurationHours: number;
  mfaEnforcementPolicy: 'disabled' | 'optional' | 'required' | 'admin_only';
}

export interface SystemMetricsConfig {
  refreshIntervalSeconds: number;
  cpuThresholdWarningPercent: number;
  memoryThresholdWarningPercent: number;
  diskThresholdWarningPercent: number;
  enableAlertNotifications: boolean;
}

export interface AuditLogConfig {
  retentionDays: number;
  logSeverityThreshold: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  enableRealtimeStreaming: boolean;
  exportFormat: 'json' | 'csv' | 'parquet';
}

export interface PolicyAdminConfig {
  autoEnforceNewPolicies: boolean;
  requireApprovalForPolicyChanges: boolean;
  minimumApprovalCount: number;
  complianceFrameworks: string[];
}

export interface TenantManagementConfig {
  multiTenancyEnabled: boolean;
  maxTenantsPerInstance: number;
  isolationLevel: 'logical' | 'database' | 'container';
  customBrandingAllowed: boolean;
}

export interface AdminRolePermission {
  id: string;
  name: string;
  scope: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'execute' | 'admin')[];
}

export interface AdminDashboardState {
  activeSection: 'overview' | 'users' | 'system' | 'audit' | 'policies' | 'tenants';
  selectedTenantId?: string;
  autoRefresh: boolean;
}

export interface AdminConfig {
  userManagement: UserManagementConfig;
  systemMetrics: SystemMetricsConfig;
  auditLogs: AuditLogConfig;
  policyAdmin: PolicyAdminConfig;
  tenantManagement: TenantManagementConfig;
  permissions: AdminRolePermission[];
}

export class AdminManager {
  private config: AdminConfig;

  constructor(initialConfig?: Partial<AdminConfig>) {
    this.config = {
      userManagement: {
        allowUserRegistration: false,
        requireEmailVerification: true,
        defaultUserRole: 'viewer',
        sessionMaxDurationHours: 12,
        mfaEnforcementPolicy: 'required',
      },
      systemMetrics: {
        refreshIntervalSeconds: 10,
        cpuThresholdWarningPercent: 80,
        memoryThresholdWarningPercent: 85,
        diskThresholdWarningPercent: 90,
        enableAlertNotifications: true,
      },
      auditLogs: {
        retentionDays: 90,
        logSeverityThreshold: 'info',
        enableRealtimeStreaming: true,
        exportFormat: 'json',
      },
      policyAdmin: {
        autoEnforceNewPolicies: false,
        requireApprovalForPolicyChanges: true,
        minimumApprovalCount: 2,
        complianceFrameworks: ['SOC2', 'GDPR', 'HIPAA', 'ISO27001'],
      },
      tenantManagement: {
        multiTenancyEnabled: true,
        maxTenantsPerInstance: 100,
        isolationLevel: 'logical',
        customBrandingAllowed: true,
      },
      permissions: [],
      ...initialConfig,
    };
  }

  public getConfig(): AdminConfig {
    return { ...this.config };
  }

  public hasPermission(role: string, permissionName: string): boolean {
    const perm = this.config.permissions.find((p) => p.name === permissionName);
    return perm ? perm.actions.includes('admin') : false;
  }
}

export function createAdminConfig(overrides?: Partial<AdminConfig>): AdminConfig {
  return new AdminManager(overrides).getConfig();
}
