/**
 * ShiVi Experience Platform — 17-State UX Machine Engine
 * Standard: UI/UX Design Implementation Specification v1.0 §2.2
 */

export type UxState =
  | 'idle'
  | 'loading'
  | 'streaming'
  | 'success'
  | 'partial_success'
  | 'warning'
  | 'error'
  | 'retrying'
  | 'offline'
  | 'degraded'
  | 'blocked'
  | 'unauthorized'
  | 'approval_required'
  | 'expired'
  | 'quarantined'
  | 'recovering'
  | 'cancelled';

export interface UxStateMetadata {
  state: UxState;
  colorToken: string;
  iconName: string;
  badgeLabel: string;
  allowsUserInteraction: boolean;
}

export class UxStateMachineEvaluator {
  private static metadataMap = new Map<UxState, UxStateMetadata>([
    ['idle', { state: 'idle', colorToken: 'neutral.500', iconName: 'circle', badgeLabel: 'IDLE', allowsUserInteraction: true }],
    ['loading', { state: 'loading', colorToken: 'blue.500', iconName: 'spinner', badgeLabel: 'LOADING', allowsUserInteraction: false }],
    ['streaming', { state: 'streaming', colorToken: 'indigo.500', iconName: 'waves', badgeLabel: 'STREAMING', allowsUserInteraction: false }],
    ['success', { state: 'success', colorToken: 'emerald.500', iconName: 'check-circle', badgeLabel: 'SUCCESS', allowsUserInteraction: true }],
    ['partial_success', { state: 'partial_success', colorToken: 'teal.500', iconName: 'alert-circle', badgeLabel: 'PARTIAL', allowsUserInteraction: true }],
    ['warning', { state: 'warning', colorToken: 'amber.500', iconName: 'triangle-alert', badgeLabel: 'WARNING', allowsUserInteraction: true }],
    ['error', { state: 'error', colorToken: 'rose.600', iconName: 'x-circle', badgeLabel: 'ERROR', allowsUserInteraction: true }],
    ['retrying', { state: 'retrying', colorToken: 'cyan.500', iconName: 'refresh-cw', badgeLabel: 'RETRYING', allowsUserInteraction: false }],
    ['offline', { state: 'offline', colorToken: 'slate.500', iconName: 'wifi-off', badgeLabel: 'OFFLINE', allowsUserInteraction: false }],
    ['degraded', { state: 'degraded', colorToken: 'orange.500', iconName: 'activity', badgeLabel: 'DEGRADED', allowsUserInteraction: true }],
    ['blocked', { state: 'blocked', colorToken: 'rose.700', iconName: 'shield-alert', badgeLabel: 'BLOCKED', allowsUserInteraction: false }],
    ['unauthorized', { state: 'unauthorized', colorToken: 'purple.600', iconName: 'lock', badgeLabel: 'UNAUTHORIZED', allowsUserInteraction: false }],
    ['approval_required', { state: 'approval_required', colorToken: 'yellow.500', iconName: 'user-check', badgeLabel: 'APPROVAL REQUIRED', allowsUserInteraction: true }],
    ['expired', { state: 'expired', colorToken: 'gray.500', iconName: 'clock-off', badgeLabel: 'EXPIRED', allowsUserInteraction: false }],
    ['quarantined', { state: 'quarantined', colorToken: 'red.700', iconName: 'biohazard', badgeLabel: 'QUARANTINED', allowsUserInteraction: false }],
    ['recovering', { state: 'recovering', colorToken: 'blue.400', iconName: 'life-buoy', badgeLabel: 'RECOVERING', allowsUserInteraction: false }],
    ['cancelled', { state: 'cancelled', colorToken: 'zinc.500', iconName: 'ban', badgeLabel: 'CANCELLED', allowsUserInteraction: true }]
  ]);

  public static getMetadata(state: UxState): UxStateMetadata {
    return this.metadataMap.get(state) || {
      state,
      colorToken: 'neutral.500',
      iconName: 'help-circle',
      badgeLabel: state.toUpperCase(),
      allowsUserInteraction: true
    };
  }
}
