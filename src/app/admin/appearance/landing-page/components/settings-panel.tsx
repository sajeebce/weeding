"use client";

import { useState } from "react";
import { X, Settings2, Layout, Type, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { LandingPageBlock } from "@prisma/client";
import { HeroSettingsForm } from "./settings-forms/hero-settings";
import type { HeroSettings } from "@/lib/landing-blocks/types";

interface SettingsPanelProps {
  block: LandingPageBlock | undefined;
  onUpdateSettings: (settings: Record<string, unknown>) => void;
  onClose: () => void;
  className?: string;
}

export function SettingsPanel({
  block,
  onUpdateSettings,
  onClose,
  className,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState("layout");

  if (!block) {
    return (
      <div className={cn("flex flex-col bg-muted/30", className)}>
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div>
            <Settings2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No block selected</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Select a block from the canvas to edit its settings
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isHeroBlock = block.type.startsWith("hero");

  return (
    <div className={cn("flex flex-col bg-background", className)}>
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold">Block Settings</h3>
          <p className="text-xs text-muted-foreground">{block.type}</p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Tabs */}
      {isHeroBlock ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-3 grid grid-cols-4">
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="mr-1 h-3 w-3" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs">
              <Type className="mr-1 h-3 w-3" />
              Content
            </TabsTrigger>
            <TabsTrigger value="trust" className="text-xs">
              <Shield className="mr-1 h-3 w-3" />
              Trust
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs">
              <Palette className="mr-1 h-3 w-3" />
              Style
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <div className="p-4">
              <HeroSettingsForm
                block={block}
                settings={block.settings as unknown as HeroSettings}
                activeTab={activeTab}
                onUpdateSettings={(s) => onUpdateSettings(s as unknown as Record<string, unknown>)}
              />
            </div>
          </ScrollArea>
        </Tabs>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Settings for {block.type} blocks are not yet implemented.
            </p>
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
