/**
 * Material rendering styles using CSS filters
 * Lightweight approach - no Three.js needed for MVP
 */

export interface MaterialStyle {
  filter: string;
  mixBlendMode?: string;
  opacity?: number;
}

/**
 * Predefined material styles for common jewelry types
 * Each style uses CSS filters to simulate realistic appearance
 */
export const materialStyles: Record<string, MaterialStyle> = {
  gold: {
    filter: 'brightness(1.1) contrast(1.05) saturate(1.3) hue-rotate(-5deg)',
    mixBlendMode: 'normal',
    opacity: 0.95
  },
  silver: {
    filter: 'brightness(1.2) contrast(0.9) saturate(0.3) grayscale(0.2)',
    mixBlendMode: 'normal',
    opacity: 0.9
  },
  diamond: {
    filter: 'brightness(1.5) contrast(1.2) saturate(0)',
    mixBlendMode: 'screen',
    opacity: 0.8
  },
  pearl: {
    filter: 'brightness(1.1) contrast(0.95) saturate(0.8) hue-rotate(10deg)',
    mixBlendMode: 'normal',
    opacity: 0.95
  },
  platinum: {
    filter: 'brightness(1.15) contrast(0.95) saturate(0.2)',
    mixBlendMode: 'normal',
    opacity: 0.92
  },
  rosegold: {
    filter: 'brightness(1.05) contrast(1.1) saturate(1.4) hue-rotate(10deg)',
    mixBlendMode: 'normal',
    opacity: 0.93
  }
};

/**
 * Get material style by material type
 * Falls back to gold if material not found
 */
export const getMaterialStyle = (material: string): MaterialStyle => {
  return materialStyles[material.toLowerCase()] || materialStyles.gold;
};
