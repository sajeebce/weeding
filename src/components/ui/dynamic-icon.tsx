"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

// Type-safe icon lookup
type IconMap = Record<string, React.ComponentType<LucideProps>>;

// Get icon component from string name
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  // Default to Package icon if name is empty or not found
  const icons = LucideIcons as unknown as IconMap;
  const IconComponent = icons[name] || LucideIcons.Package;

  return <IconComponent {...props} />;
}

// For server components - returns the icon component itself
export function getIconComponent(name: string): React.ComponentType<LucideProps> {
  const icons = LucideIcons as unknown as IconMap;
  return icons[name] || LucideIcons.Package;
}
