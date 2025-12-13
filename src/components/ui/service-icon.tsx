"use client";

import * as LucideIcons from "lucide-react";
import { LucideProps } from "lucide-react";

interface ServiceIconProps extends LucideProps {
  name: string;
}

// Type-safe icon lookup
type IconMap = Record<string, React.ComponentType<LucideProps>>;

export function ServiceIcon({ name, ...props }: ServiceIconProps) {
  const icons = LucideIcons as unknown as IconMap;
  const IconComponent = icons[name] || LucideIcons.Package;

  return <IconComponent {...props} />;
}
