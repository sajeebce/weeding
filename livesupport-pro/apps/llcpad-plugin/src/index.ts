// Types
export type {
  PluginContext,
  PluginLifecycle,
  PluginSettings,
  PluginAPI,
  RouteConfig,
  WidgetConfig,
  NotificationConfig,
} from './types';

// Lifecycle hooks
export { lifecycle } from './lifecycle';

// Components
export * from './components';

// Re-export from shared packages for convenience
export {
  TicketService,
  MessageService,
  ChatService,
  NotificationService,
} from '@livesupport/core/services';

export type {
  Ticket,
  Message,
  ChatSession,
  Notification,
  TicketStatus,
  TicketPriority,
} from '@livesupport/core/types';

export {
  useSocket,
  useChat,
  useAgentChat,
  useTickets,
  ChatWidget,
  TicketList,
  MessageThread,
  MessageInput,
} from '@livesupport/ui';

export { createAIChatService } from '@livesupport/ai';

/**
 * Plugin entry point
 * Returns plugin configuration and lifecycle hooks
 */
export function createPlugin() {
  return {
    name: 'livesupport-pro',
    version: '1.0.0',
    lifecycle: require('./lifecycle').lifecycle,
    components: {
      AdminDashboard: require('./components/admin-dashboard').AdminDashboard,
      ChatWidgetWrapper: require('./components/chat-widget-wrapper').ChatWidgetWrapper,
    },
  };
}
