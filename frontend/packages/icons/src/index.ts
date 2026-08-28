export type IconName = 'agent' | 'workflow' | 'security' | 'analytics' | 'settings' | 'tenant' | 'model' | 'tool' | 'evidence' | 'risk' | 'search' | 'notification' | 'dashboard' | 'chart' | 'code' | 'deploy' | 'monitor' | 'shield' | 'key' | 'globe';
export interface IconProps { name: IconName; size?: number; color?: string; }

export class ShiViIcons {
  static getIconSvgPath(name: IconName): string {
    return `icon-path-for-${name}`;
  }

  static getAvailableIcons(): IconName[] {
    return [
      'agent', 'workflow', 'security', 'analytics', 'settings', 'tenant', 'model', 'tool',
      'evidence', 'risk', 'search', 'notification', 'dashboard', 'chart', 'code',
      'deploy', 'monitor', 'shield', 'key', 'globe'
    ];
  }
}
