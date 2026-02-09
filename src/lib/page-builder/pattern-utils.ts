// ============================================
// PATTERN OVERLAY CSS UTILITIES
// ============================================

import type { PatternType } from "./types";

/**
 * Convert hex color to rgba string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return hex;
}

/**
 * Generate CSS background-image value for a pattern type
 */
export function getPatternCSS(type: PatternType, color: string, opacity: number): string {
  const adjustedColor = hexToRgba(color, opacity);

  switch (type) {
    case "dots":
      return `radial-gradient(${adjustedColor} 1.5px, transparent 1.5px)`;
    case "grid":
      return `linear-gradient(${adjustedColor} 2px, transparent 2px), linear-gradient(90deg, ${adjustedColor} 2px, transparent 2px)`;
    case "diagonal":
      return `repeating-linear-gradient(45deg, ${adjustedColor}, ${adjustedColor} 1px, transparent 1px, transparent 10px)`;
    case "waves": {
      const waveSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q 25 0, 50 10 T 100 10 V 20 H 0 Z" fill="${color}" opacity="${opacity}"/></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(waveSvg)}")`;
    }
    case "circuit": {
      const circuitSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><path d="M30 0v15M0 30h15M30 45v15M45 30h15" stroke="${color}" stroke-opacity="${opacity}" fill="none" stroke-width="1"/><circle cx="30" cy="30" r="4" fill="${color}" fill-opacity="${opacity}"/></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(circuitSvg)}")`;
    }
    case "geometric": {
      const hexSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="100" viewBox="0 0 56 100"><path d="M28 66L0 50V16L28 0L56 16V50L28 66L0 50" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(hexSvg)}")`;
    }
    case "confetti": {
      const confettiSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="5" cy="5" r="2" fill="${color}" fill-opacity="${opacity}"/><circle cx="25" cy="15" r="1.5" fill="${color}" fill-opacity="${opacity * 0.7}"/><circle cx="15" cy="30" r="2" fill="${color}" fill-opacity="${opacity * 0.8}"/><circle cx="35" cy="35" r="1" fill="${color}" fill-opacity="${opacity}"/></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(confettiSvg)}")`;
    }
    default:
      return "none";
  }
}

/**
 * Get background-size value for a pattern type
 */
export function getPatternBackgroundSize(type: PatternType): string {
  switch (type) {
    case "dots":
      return "40px 40px";
    case "grid":
      return "80px 50px, 80px 50px";
    case "diagonal":
      return "auto";
    case "waves":
      return "100% 20px";
    case "circuit":
      return "60px 60px";
    case "geometric":
      return "56px 100px";
    case "confetti":
      return "40px 40px";
    default:
      return "auto";
  }
}

/**
 * Pattern type options for the UI dropdown
 */
export const PATTERN_TYPE_OPTIONS = [
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "diagonal", label: "Diagonal" },
  { value: "waves", label: "Waves" },
  { value: "circuit", label: "Circuit" },
  { value: "geometric", label: "Geometric" },
  { value: "confetti", label: "Confetti" },
] as const;
