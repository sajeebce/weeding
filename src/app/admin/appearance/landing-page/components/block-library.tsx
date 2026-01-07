"use client";

import { useState } from "react";
import { Search, LayoutTemplate, Type, Image, Star, MessageSquare, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BlockLibraryProps {
  onAddBlock: (type: string) => void;
  className?: string;
}

interface BlockDefinition {
  type: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
}

const blockDefinitions: BlockDefinition[] = [
  // Hero blocks
  {
    type: "hero-centered",
    name: "Hero - Centered",
    description: "Centered headline with CTA buttons",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-split",
    name: "Hero - Split",
    description: "Two-column layout with image",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-split-dashboard",
    name: "Hero - Dashboard",
    description: "Animated words with dashboard visual",
    icon: LayoutTemplate,
    category: "hero",
  },
  {
    type: "hero-minimal",
    name: "Hero - Minimal",
    description: "Clean text-only hero section",
    icon: LayoutTemplate,
    category: "hero",
  },
  // Content blocks (placeholders for future)
  {
    type: "features",
    name: "Features",
    description: "Feature grid or list section",
    icon: Star,
    category: "content",
  },
  {
    type: "testimonials",
    name: "Testimonials",
    description: "Customer testimonials carousel",
    icon: MessageSquare,
    category: "content",
  },
  {
    type: "team",
    name: "Team",
    description: "Team members grid",
    icon: Users,
    category: "content",
  },
  {
    type: "text",
    name: "Text Block",
    description: "Rich text content area",
    icon: Type,
    category: "content",
  },
  {
    type: "image",
    name: "Image",
    description: "Full-width or contained image",
    icon: Image,
    category: "media",
  },
];

const categories = [
  { id: "all", name: "All Blocks" },
  { id: "hero", name: "Hero" },
  { id: "content", name: "Content" },
  { id: "media", name: "Media" },
];

export function BlockLibrary({ onAddBlock, className }: BlockLibraryProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredBlocks = blockDefinitions.filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(search.toLowerCase()) ||
      block.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || block.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={cn("flex flex-col bg-muted/30", className)}>
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="mb-3 text-sm font-semibold">Add Block</h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1 border-b p-2">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredBlocks.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No blocks found
            </p>
          ) : (
            <div className="space-y-1">
              {filteredBlocks.map((block) => (
                <button
                  key={block.type}
                  onClick={() => onAddBlock(block.type)}
                  className="flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <block.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{block.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {block.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
