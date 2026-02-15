import type { WidgetContainerStyle } from "@/lib/page-builder/types";
import { cn } from "@/lib/utils";

interface WidgetContainerProps {
  container?: WidgetContainerStyle;
  children: React.ReactNode;
  className?: string;
}

function getShadowClass(shadow?: string) {
  switch (shadow) {
    case "sm": return "shadow-sm";
    case "md": return "shadow-md";
    case "lg": return "shadow-lg";
    default: return "";
  }
}

export function WidgetContainer({ container, children, className }: WidgetContainerProps) {
  if (!container) return <>{children}</>;

  const hasGradientBorder = container.gradientBorder?.enabled &&
    container.gradientBorder.colors?.length >= 2;

  const borderRadius = container.borderRadius || 0;
  const borderWidth = container.borderWidth || 2;

  // Container background
  const getBackground = (): string | undefined => {
    if (container.backgroundType === "gradient" && container.gradientBackground?.colors?.length) {
      const { colors, angle } = container.gradientBackground;
      return `linear-gradient(${angle}deg, ${colors.join(", ")})`;
    }
    return undefined;
  };

  const background = getBackground();
  const bgColor = !background ? (container.backgroundColor || undefined) : undefined;

  const innerContent = (
    <div
      className={cn(
        !hasGradientBorder && getShadowClass(container.shadow),
        className,
      )}
      style={{
        background,
        backgroundColor: bgColor,
        borderRadius: hasGradientBorder
          ? `${Math.max(0, borderRadius - borderWidth)}px`
          : borderRadius ? `${borderRadius}px` : undefined,
        padding: container.padding ? `${container.padding}px` : undefined,
        maxWidth: !hasGradientBorder && container.maxWidth
          ? `${container.maxWidth}px`
          : undefined,
      }}
    >
      {children}
    </div>
  );

  if (hasGradientBorder) {
    const { colors, angle } = container.gradientBorder!;
    return (
      <div
        className={getShadowClass(container.shadow)}
        style={{
          padding: `${borderWidth}px`,
          background: `linear-gradient(${angle}deg, ${colors.join(", ")})`,
          borderRadius: `${borderRadius}px`,
          maxWidth: container.maxWidth ? `${container.maxWidth}px` : undefined,
        }}
      >
        {innerContent}
      </div>
    );
  }

  return innerContent;
}
