import type { PrismaClient } from '@prisma/client';

/**
 * Plugin context provided by LLCPad CMS
 */
export interface PluginContext {
  prisma: PrismaClient;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  settings: Record<string, any>;
  socketUrl?: string;
}

/**
 * Plugin lifecycle hooks
 */
export interface PluginLifecycle {
  install: (context: PluginContext) => Promise<void>;
  uninstall: (context: PluginContext) => Promise<void>;
  enable: (context: PluginContext) => Promise<void>;
  disable: (context: PluginContext) => Promise<void>;
}

/**
 * Plugin settings as defined in plugin.json
 */
export interface PluginSettings {
  chatEnabled: boolean;
  aiEnabled: boolean;
  widgetPosition: 'bottom-right' | 'bottom-left';
  primaryColor: string;
  openaiApiKey?: string;
  aiModel: string;
}

/**
 * Plugin API for interacting with the CMS
 */
export interface PluginAPI {
  // Navigation
  registerAdminRoute: (route: RouteConfig) => void;
  registerPublicRoute: (route: RouteConfig) => void;

  // Widgets
  registerWidget: (widget: WidgetConfig) => void;

  // Settings
  getSettings: () => PluginSettings;
  updateSettings: (settings: Partial<PluginSettings>) => Promise<void>;

  // Notifications
  sendNotification: (notification: NotificationConfig) => Promise<void>;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  label: string;
  icon?: string;
}

export interface WidgetConfig {
  id: string;
  component: React.ComponentType;
  position: 'floating' | 'sidebar' | 'header';
  enabled: boolean;
}

export interface NotificationConfig {
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}
