"use client";

import * as LucideIcons from "lucide-react";
import type { TopUtilityBarWidgetSettings } from "@/lib/page-builder/types";
import { DEFAULT_TOP_UTILITY_BAR_SETTINGS } from "@/lib/page-builder/defaults";
import { useState } from "react";

interface TopUtilityBarWidgetProps {
  settings: Partial<TopUtilityBarWidgetSettings>;
  isPreview?: boolean;
}

function getLucideIcon(name: string): React.ComponentType<{ size?: number; strokeWidth?: number }> | null {
  if (!name) return null;
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>;
  return icons[name] ?? null;
}

function UtilityLink({
  label,
  href,
  showIcon,
  icon,
  textColor,
  hoverColor,
  fontSize,
  gap,
  isPreview,
}: {
  label: string;
  href: string;
  showIcon: boolean;
  icon: string;
  textColor: string;
  hoverColor: string;
  fontSize: number;
  gap: number;
  isPreview?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const IconComponent = showIcon ? getLucideIcon(icon) : null;

  const linkStyle: React.CSSProperties = {
    color: hovered ? hoverColor : textColor,
    fontSize: `${fontSize}px`,
    fontWeight: 500,
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    gap: `${gap * 0.333}px`,
    transition: "color 0.2s",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) { e.preventDefault(); return; }
  };

  return (
    <a
      href={href}
      style={linkStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {IconComponent && <IconComponent size={14} strokeWidth={2} />}
      <span>{label}</span>
    </a>
  );
}

export function TopUtilityBarWidget({ settings: partialSettings, isPreview }: TopUtilityBarWidgetProps) {
  const settings: TopUtilityBarWidgetSettings = {
    ...DEFAULT_TOP_UTILITY_BAR_SETTINGS,
    ...partialSettings,
    links: partialSettings.links ?? DEFAULT_TOP_UTILITY_BAR_SETTINGS.links,
  };

  const {
    gradientFrom,
    gradientTo,
    gradientAngle,
    borderBottomColor,
    showBorderBottom,
    height,
    textColor,
    hoverColor,
    fontSize,
    paddingX,
    gap,
    links,
  } = settings;

  const barStyle: React.CSSProperties = {
    background: `linear-gradient(${gradientAngle}deg, ${gradientFrom}, ${gradientTo})`,
    borderBottom: showBorderBottom ? `1px solid ${borderBottomColor}` : "none",
    height: `${height}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingLeft: `${paddingX}px`,
    paddingRight: `${paddingX}px`,
    width: "100%",
  };

  const linksStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: `${gap}px`,
  };

  return (
    <div style={barStyle}>
      <div style={linksStyle}>
        {links.map((link) => (
          <UtilityLink
            key={link.id}
            label={link.label}
            href={link.href}
            showIcon={link.showIcon}
            icon={link.icon}
            textColor={textColor}
            hoverColor={hoverColor}
            fontSize={fontSize}
            gap={gap}
            isPreview={isPreview}
          />
        ))}
      </div>
    </div>
  );
}
