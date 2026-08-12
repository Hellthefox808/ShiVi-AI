/**
 * @shivi/app-web
 * Next.js Main Web Application Configuration Types & Module Exports
 */

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  children?: NavigationItem[];
  requiresAuth?: boolean;
  requiredRoles?: string[];
}

export interface AppThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
  accentColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  fontFamily: string;
  denseMode?: boolean;
}

export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  isProtected: boolean;
  allowedRoles?: string[];
  layout?: 'default' | 'auth' | 'dashboard' | 'minimal';
}

export interface UserSessionConfig {
  sessionTimeoutMinutes: number;
  autoRefreshTokens: boolean;
  persistentSession: boolean;
  mfaRequired: boolean;
}

export interface WebAppFeatures {
  enableAiAssistant: boolean;
  enableRealtimeNotifications: boolean;
  enableDarkMode: boolean;
  enableAnalyticsTracking: boolean;
  enableMultiLanguage: boolean;
  experimentalFeatures: Record<string, boolean>;
}

export interface WebAppConfig {
  appName: string;
  appVersion: string;
  apiBaseUrl: string;
  cdnBaseUrl?: string;
  theme: AppThemeConfig;
  features: WebAppFeatures;
  session: UserSessionConfig;
  navigation: NavigationItem[];
  routes: RouteConfig[];
}

export class WebAppManager {
  private config: WebAppConfig;

  constructor(initialConfig?: Partial<WebAppConfig>) {
    this.config = {
      appName: 'ShiVi Web',
      appVersion: '1.0.0',
      apiBaseUrl: '/api/v1',
      theme: {
        mode: 'system',
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        borderRadius: 'md',
        fontFamily: 'Inter, sans-serif',
      },
      features: {
        enableAiAssistant: true,
        enableRealtimeNotifications: true,
        enableDarkMode: true,
        enableAnalyticsTracking: true,
        enableMultiLanguage: false,
        experimentalFeatures: {},
      },
      session: {
        sessionTimeoutMinutes: 60,
        autoRefreshTokens: true,
        persistentSession: true,
        mfaRequired: false,
      },
      navigation: [],
      routes: [],
      ...initialConfig,
    };
  }

  public getConfig(): WebAppConfig {
    return { ...this.config };
  }

  public updateConfig(patch: Partial<WebAppConfig>): WebAppConfig {
    this.config = { ...this.config, ...patch };
    return this.getConfig();
  }

  public isFeatureEnabled(featureName: keyof WebAppFeatures | string): boolean {
    if (featureName in this.config.features) {
      return Boolean(this.config.features[featureName as keyof WebAppFeatures]);
    }
    return Boolean(this.config.features.experimentalFeatures[featureName]);
  }
}

export function createWebAppConfig(overrides?: Partial<WebAppConfig>): WebAppConfig {
  return new WebAppManager(overrides).getConfig();
}
