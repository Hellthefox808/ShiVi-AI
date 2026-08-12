/**
 * ShiVi X100+ 18 Edge States Renderer Engine
 * Standard: UI/UX Spec v1.0 §7, SAD v2.0 §38
 */

export type EdgeStateKind =
  | 'loading'
  | 'skeleton'
  | 'empty'
  | 'partial'
  | 'success'
  | 'warning'
  | 'error'
  | 'retry'
  | 'offline'
  | 'degraded'
  | 'unauthorized'
  | 'forbidden'
  | 'approval-required'
  | 'expired'
  | 'conflict'
  | 'quarantined'
  | 'recovering'
  | 'cancelled';

export interface EdgeStateDescriptor {
  kind: EdgeStateKind;
  title: string;
  message: string;
  actionRequired: boolean;
  actionLabel?: string;
}

export class EdgeStatesRegistry {
  private static descriptors: Record<EdgeStateKind, EdgeStateDescriptor> = {
    loading: { kind: 'loading', title: 'Loading Task Context', message: 'Fetching agent workspace assets...', actionRequired: false },
    skeleton: { kind: 'skeleton', title: 'Rendering Workspace Layout', message: 'Initializing placeholder UI skeleton...', actionRequired: false },
    empty: { kind: 'empty', title: 'No Data Records Available', message: 'No active agent trajectories found for this tenant.', actionRequired: true, actionLabel: 'Create Agent' },
    partial: { kind: 'partial', title: 'Partial Response Rendered', message: 'Displaying available telemetry while background task executes.', actionRequired: false },
    success: { kind: 'success', title: 'Operation Completed', message: 'Agent task executed successfully with evidence logged.', actionRequired: false },
    warning: { kind: 'warning', title: 'High Token Utilization', message: 'Budget utilization is approaching soft threshold (85%).', actionRequired: false },
    error: { kind: 'error', title: 'Execution Exception', message: 'An unhandled exception occurred during step execution.', actionRequired: true, actionLabel: 'Retry Task' },
    retry: { kind: 'retry', title: 'Retrying Transient Failure', message: 'Executing exponential backoff retry attempt 2/3...', actionRequired: false },
    offline: { kind: 'offline', title: 'Network Disconnected', message: 'Client connection lost. Retrying when online...', actionRequired: true, actionLabel: 'Reconnect' },
    degraded: { kind: 'degraded', title: 'System Operating in Degraded Mode', message: 'Primary model provider fallback active. Rerouting queries.', actionRequired: false },
    unauthorized: { kind: 'unauthorized', title: 'Authentication Required', message: 'Session token missing or expired.', actionRequired: true, actionLabel: 'Log In' },
    forbidden: { kind: 'forbidden', title: 'Access Restricted', message: 'Your user role does not possess capability for this operation.', actionRequired: false },
    'approval-required': { kind: 'approval-required', title: 'Human Approval Required', message: 'T4 risk operation requires explicit human authorization.', actionRequired: true, actionLabel: 'Approve Operation' },
    expired: { kind: 'expired', title: 'Capability Token Expired', message: 'The active capability token lifetime has elapsed.', actionRequired: true, actionLabel: 'Re-issue Token' },
    conflict: { kind: 'conflict', title: 'State Conflict Detected', message: 'Memory record conflict detected across concurrent turns.', actionRequired: true, actionLabel: 'Resolve Conflict' },
    quarantined: { kind: 'quarantined', title: 'Agent Quarantined', message: 'Adversarial prompt injection attempt contained by security governor.', actionRequired: true, actionLabel: 'Security Review' },
    recovering: { kind: 'recovering', title: 'Recovery Execution in Progress', message: 'Agent recovery state machine purging working memory...', actionRequired: false },
    cancelled: { kind: 'cancelled', title: 'Execution Aborted', message: 'Task run was cancelled by user or FinOps cost ceiling.', actionRequired: false },
  };

  public static getDescriptor(kind: EdgeStateKind): EdgeStateDescriptor {
    return this.descriptors[kind];
  }

  public static renderState(kind: EdgeStateKind): { descriptor: EdgeStateDescriptor; renderedAt: number } {
    return {
      descriptor: this.getDescriptor(kind),
      renderedAt: Date.now(),
    };
  }
}
