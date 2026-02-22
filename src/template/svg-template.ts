import type {
  OgImageConfig,
  StyleConfig,
  ColorConfig,
  LogoConfig,
} from "../types.js";
import { escapeSvgText, truncateText } from "./svg-utils.js";
import {
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  CONTENT_WIDTH,
  FONT_SIZE_NAME,
  FONT_SIZE_TAGLINE,
  FONT_SIZE_FEATURES,
  FONT_SIZE_FOOTER,
  FEATURE_SEPARATOR,
  calculateLayout,
} from "./layout.js";
import { getFontFamily } from "../font/font-loader.js";
import { resolvePreset } from "../preset/presets.js";
import type { Preset } from "../preset/presets.js";

// --- Default colors ---

const DEFAULT_COLORS: Required<ColorConfig> = {
  background: "#0a0a0a",
  accent: "#22d3ee",
  dim: "#a1a1aa",
  text: "#fafafa",
};

// --- Style resolution ---

export interface ResolvedStyle {
  scanlines: false | { opacity: number };
  cornerBrackets: false | { opacity: number; strokeWidth: number };
  radialGlow: false | { opacity: number; cy: string; r: string };
  colors: ColorConfig;
}

function resolveBoolOrOptions<T extends Record<string, unknown>>(
  value: boolean | Partial<T> | undefined,
  defaults: T,
): false | T {
  if (value === undefined || value === false) return false;
  if (value === true) return defaults;
  // Safe assertion: spreading complete T with Partial<T> always yields T
  return { ...defaults, ...value } as T;
}

/**
 * Resolve the final style by layering: preset defaults -> explicit style overrides.
 * Also extracts any color overrides from the preset.
 */
export function resolveStyle(style?: StyleConfig): ResolvedStyle {
  const preset: Preset = resolvePreset(style?.preset);

  // Start from preset decoration values
  let scanlines = resolveBoolOrOptions<{ opacity: number }>(
    preset.scanlines,
    { opacity: 0.03 },
  );
  let cornerBrackets = resolveBoolOrOptions<{
    opacity: number;
    strokeWidth: number;
  }>(preset.cornerBrackets, { opacity: 0.15, strokeWidth: 2 });
  let radialGlow = resolveBoolOrOptions<{
    opacity: number;
    cy: string;
    r: string;
  }>(preset.radialGlow, { opacity: 0.15, cy: "35%", r: "50%" });

  // Explicit style fields override preset
  if (style?.scanlines !== undefined) {
    scanlines = resolveBoolOrOptions(style.scanlines, { opacity: 0.03 });
  }
  if (style?.cornerBrackets !== undefined) {
    cornerBrackets = resolveBoolOrOptions(style.cornerBrackets, {
      opacity: 0.15,
      strokeWidth: 2,
    });
  }
  if (style?.radialGlow !== undefined) {
    radialGlow = resolveBoolOrOptions(style.radialGlow, {
      opacity: 0.15,
      cy: "35%",
      r: "50%",
    });
  }

  return { scanlines, cornerBrackets, radialGlow, colors: preset.colors ?? {} };
}

// --- SVG fragment builders ---

function buildDefs(
  colors: Required<ColorConfig>,
  resolved: ResolvedStyle,
): string {
  const parts: string[] = [];

  if (resolved.radialGlow) {
    parts.push(`
    <radialGradient id="glow" cx="50%" cy="${resolved.radialGlow.cy}" r="${resolved.radialGlow.r}">
      <stop offset="0%" stop-color="${colors.accent}" stop-opacity="${resolved.radialGlow.opacity}"/>
      <stop offset="100%" stop-color="${colors.accent}" stop-opacity="0"/>
    </radialGradient>`);
  }

  if (resolved.scanlines) {
    parts.push(`
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="${colors.text}" opacity="${resolved.scanlines.opacity}"/>
    </pattern>`);
  }

  if (parts.length === 0) return "";
  return `<defs>${parts.join("")}\n  </defs>`;
}

function buildBackground(
  colors: Required<ColorConfig>,
  resolved: ResolvedStyle,
  width: number,
  height: number,
): string {
  let bg = `<rect width="${width}" height="${height}" fill="${colors.background}"/>`;

  if (resolved.radialGlow) {
    bg += `\n  <rect width="${width}" height="${height}" fill="url(#glow)"/>`;
  }

  if (resolved.scanlines) {
    bg += `\n  <rect width="${width}" height="${height}" fill="url(#scanlines)"/>`;
  }

  return bg;
}

function buildCornerBrackets(
  resolved: ResolvedStyle,
  colors: Required<ColorConfig>,
  width: number,
  height: number,
): string {
  if (!resolved.cornerBrackets) return "";

  const { opacity, strokeWidth } = resolved.cornerBrackets;
  const m = 24; // margin from edge
  const len = 40; // bracket arm length
  const color = colors.dim;

  return `
  <g opacity="${opacity}" stroke="${color}" stroke-width="${strokeWidth}" fill="none">
    <polyline points="${m + len},${m} ${m},${m} ${m},${m + len}"/>
    <polyline points="${width - m - len},${m} ${width - m},${m} ${width - m},${m + len}"/>
    <polyline points="${m + len},${height - m} ${m},${height - m} ${m},${height - m - len}"/>
    <polyline points="${width - m - len},${height - m} ${width - m},${height - m} ${width - m},${height - m - len}"/>
  </g>`;
}

function buildLogo(
  logo: LogoConfig | undefined,
  centerX: number,
  y: number,
  logoHeight: number,
  colors: Required<ColorConfig>,
  fontFamily: string,
): string {
  if (!logo) return "";

  if (logo.type === "text") {
    const escaped = escapeSvgText(logo.text);
    return `<text x="${centerX}" y="${y + logoHeight * 0.7}" font-family="${fontFamily}" font-size="48" font-weight="700" fill="${colors.text}" text-anchor="middle">${escaped}</text>`;
  }

  if (logo.type === "svg-inline") {
    const logoWidth = logoHeight; // square by default
    const logoX = centerX - logoWidth / 2;
    return `<svg x="${logoX}" y="${y}" width="${logoWidth}" height="${logoHeight}" viewBox="${logo.viewBox}">${logo.content}</svg>`;
  }

  // svg-file: content must be pre-extracted before building SVG
  // This case shouldn't occur in buildSvg — extractSvgContent should be called first
  return "";
}

function buildFeatures(
  features: string[],
  centerX: number,
  y: number,
  colors: Required<ColorConfig>,
  fontFamily: string,
): string {
  if (features.length === 0) return "";

  const text = features.join(FEATURE_SEPARATOR);
  const escaped = escapeSvgText(text);

  return `<text x="${centerX}" y="${y}" font-family="${fontFamily}" font-size="${FONT_SIZE_FEATURES}" fill="${colors.dim}" text-anchor="middle" letter-spacing="0.5">${escaped}</text>`;
}

// --- Main SVG builder ---

export function buildSvg(config: OgImageConfig): string {
  const width = config.width ?? DEFAULT_WIDTH;
  const height = config.height ?? DEFAULT_HEIGHT;
  const resolved = resolveStyle(config.style);
  // Layer: defaults -> preset colors -> explicit config colors
  const colors = { ...DEFAULT_COLORS, ...resolved.colors, ...config.colors };
  const fontFamily = getFontFamily(config.font);

  const layout = calculateLayout({
    hasLogo: !!config.logo,
    hasTagline: !!config.tagline,
    hasFeatures: !!config.features?.length,
    hasFooter: !!config.footer,
    height,
  });

  const centerX = width / 2;

  // Truncate text to fit
  const maxNameChars = Math.floor(CONTENT_WIDTH / (FONT_SIZE_NAME * 0.55));
  const maxTaglineChars = Math.floor(
    CONTENT_WIDTH / (FONT_SIZE_TAGLINE * 0.55),
  );
  const maxFooterChars = Math.floor(
    CONTENT_WIDTH / (FONT_SIZE_FOOTER * 0.55),
  );

  const name = escapeSvgText(truncateText(config.name, maxNameChars));
  const tagline = config.tagline
    ? escapeSvgText(truncateText(config.tagline, maxTaglineChars))
    : "";
  const footer = config.footer
    ? escapeSvgText(truncateText(config.footer, maxFooterChars))
    : "";

  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
  ];

  // Defs (gradients, patterns)
  const defs = buildDefs(colors, resolved);
  if (defs) parts.push(`  ${defs}`);

  // Background + overlays
  parts.push(`  ${buildBackground(colors, resolved, width, height)}`);

  // Corner brackets
  parts.push(buildCornerBrackets(resolved, colors, width, height));

  // Logo
  parts.push(
    buildLogo(config.logo, centerX, layout.logoY, layout.logoHeight, colors, fontFamily),
  );

  // Project name
  const nameFontWeight = config.style?.nameFontWeight ?? 700;
  const nameLetterSpacing = config.style?.nameLetterSpacing ?? 2;
  parts.push(
    `  <text x="${centerX}" y="${layout.nameY}" font-family="${fontFamily}" font-size="${FONT_SIZE_NAME}" font-weight="${nameFontWeight}" fill="${colors.accent}" text-anchor="middle" letter-spacing="${nameLetterSpacing}">${name}</text>`,
  );

  // Tagline
  if (tagline) {
    parts.push(
      `  <text x="${centerX}" y="${layout.taglineY}" font-family="${fontFamily}" font-size="${FONT_SIZE_TAGLINE}" fill="${colors.dim}" text-anchor="middle">${tagline}</text>`,
    );
  }

  // Features
  if (config.features?.length) {
    parts.push(
      `  ${buildFeatures(config.features, centerX, layout.featuresY, colors, fontFamily)}`,
    );
  }

  // Footer
  if (footer) {
    parts.push(
      `  <text x="${centerX}" y="${layout.footerY}" font-family="${fontFamily}" font-size="${FONT_SIZE_FOOTER}" fill="${colors.dim}" text-anchor="middle" opacity="0.5">${footer}</text>`,
    );
  }

  parts.push("</svg>");

  return parts.filter(Boolean).join("\n");
}
