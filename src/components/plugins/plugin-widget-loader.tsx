"use client";

import { useEffect, useState } from "react";

interface PluginWidget {
  pluginSlug: string;
  widgetName: string;
  position: string;
  config: Record<string, unknown>;
}

interface PluginWidgetLoaderProps {
  position: "body-end" | "body-start" | "header" | "footer";
}

/**
 * Dynamic Plugin Widget Loader
 * Loads widgets from active plugins based on their manifest configuration.
 *
 * This component fetches active plugin widgets from the API and renders
 * placeholder/loading states. The actual widget rendering is handled by
 * each plugin's own script/component that gets injected when the plugin is active.
 */
export function PluginWidgetLoader({ position }: PluginWidgetLoaderProps) {
  const [widgets, setWidgets] = useState<PluginWidget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidgets() {
      try {
        const response = await fetch(`/api/plugins/widgets?position=${position}`);
        if (response.ok) {
          const data = await response.json();
          setWidgets(data.widgets || []);
        }
      } catch (error) {
        console.error("Error loading plugin widgets:", error);
      } finally {
        setLoading(false);
      }
    }

    loadWidgets();
  }, [position]);

  // Don't render anything while loading or if no widgets
  if (loading || widgets.length === 0) {
    return null;
  }

  return (
    <>
      {widgets.map((widget) => (
        <div
          key={`${widget.pluginSlug}-${widget.widgetName}`}
          id={`plugin-widget-${widget.pluginSlug}-${widget.widgetName}`}
          data-plugin={widget.pluginSlug}
          data-widget={widget.widgetName}
          data-config={JSON.stringify(widget.config)}
        >
          {/* Widget content is injected by the plugin's script */}
        </div>
      ))}
    </>
  );
}
