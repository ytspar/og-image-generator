export const DEFAULT_WIDTH = 1200;
export const DEFAULT_HEIGHT = 630;

const PADDING_X = 80;
export const CONTENT_WIDTH = DEFAULT_WIDTH - PADDING_X * 2;

export const FONT_SIZE_NAME = 52;
export const FONT_SIZE_TAGLINE = 22;
export const FONT_SIZE_FEATURES = 16;
export const FONT_SIZE_FOOTER = 18;

export const FEATURE_SEPARATOR = " | ";

export interface LayoutPositions {
  logoY: number;
  logoHeight: number;
  nameY: number;
  taglineY: number;
  featuresY: number;
  footerY: number;
}

export interface LayoutInput {
  hasLogo: boolean;
  hasTagline: boolean;
  hasFeatures: boolean;
  hasFooter: boolean;
  height?: number;
}

/**
 * Calculate vertical positions for content sections.
 * Centers the content block vertically, adjusting based on which sections are present.
 */
export function calculateLayout(input: LayoutInput): LayoutPositions {
  const height = input.height ?? DEFAULT_HEIGHT;

  // Calculate total content height
  const logoHeight = input.hasLogo ? 80 : 0;
  const logoGap = input.hasLogo ? 32 : 0;
  const nameHeight = FONT_SIZE_NAME;
  const taglineGap = input.hasTagline ? 20 : 0;
  const taglineHeight = input.hasTagline ? FONT_SIZE_TAGLINE : 0;
  const featuresGap = input.hasFeatures ? 36 : 0;
  const featuresHeight = input.hasFeatures ? FONT_SIZE_FEATURES + 20 : 0; // pill height

  const totalContent =
    logoHeight +
    logoGap +
    nameHeight +
    taglineGap +
    taglineHeight +
    featuresGap +
    featuresHeight;

  // Start position to center the main content block
  const startY = (height - totalContent) / 2;

  let y = startY;

  const logoY = y;
  y += logoHeight + logoGap;

  const nameY = y + FONT_SIZE_NAME * 0.8; // baseline offset
  y += nameHeight;

  const taglineY = y + taglineGap + FONT_SIZE_TAGLINE * 0.8;
  y += taglineGap + taglineHeight;

  const featuresY = y + featuresGap + FONT_SIZE_FEATURES * 0.8;

  // Footer is always pinned near the bottom
  const footerY = input.hasFooter ? height - 40 : height;

  return {
    logoY,
    logoHeight,
    nameY,
    taglineY,
    featuresY,
    footerY,
  };
}
