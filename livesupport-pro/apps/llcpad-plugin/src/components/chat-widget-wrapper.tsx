'use client';

import { ChatWidget } from '@livesupport/ui';
import type { PluginContext, PluginSettings } from '../types';

interface ChatWidgetWrapperProps {
  context: PluginContext;
}

/**
 * Chat widget wrapper that integrates @livesupport/ui ChatWidget
 * with LLCPad CMS context and settings
 */
export function ChatWidgetWrapper({ context }: ChatWidgetWrapperProps) {
  const settings = context.settings as PluginSettings;

  // Don't render if chat is disabled
  if (!settings.chatEnabled) {
    return null;
  }

  return (
    <ChatWidget
      socketUrl={context.socketUrl || ''}
      token={context.currentUser?.id}
      visitorName={context.currentUser?.name}
      visitorEmail={context.currentUser?.email}
      position={settings.widgetPosition}
      primaryColor={settings.primaryColor}
      title="Support"
      subtitle="We're here to help!"
      placeholder="Type your message..."
    />
  );
}
