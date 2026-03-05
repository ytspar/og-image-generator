// --- Logo configuration ---

export interface LogoSvgInline {
  /** Raw SVG content (inner elements, no <svg> wrapper needed) */
  content: string;
  type: "svg-inline";
  /** viewBox dimensions, e.g. "0 0 100 100" */
  viewBox: string;
}

export interface LogoSvgFile {
  /** Path to SVG file */
  path: string;
  /** Optional CSS selector for a <g> element to extract (e.g. "#wordmark") */
  selector?: string;
  type: "svg-file";
}

export interface LogoText {
  /** Text to display as logo fallback */
  text: string;
  type: "text";
}

export type LogoConfig = LogoSvgInline | LogoSvgFile | LogoText;

// --- Color configuration ---

export interface ColorConfig {
  /** Accent color for project name and highlights (default: "#22d3ee") */
  accent?: string;
  /** Background color (default: "#0a0a0a") */
  background?: string;
  /** Dim color for secondary text (default: "#a1a1aa") */
  dim?: string;
  /** Primary text color (default: "#fafafa") */
  text?: string;
}

// --- Font configuration ---

export interface FontConfig {
  /** Path to bold weight font file */
  boldPath?: string;
  /** Font family name (default: "Inter") */
  family?: string;
  /** Path to regular weight font file (TTF, OTF, or WOFF2) */
  path?: string;
}

// --- Style configuration ---

export interface ScanlineOptions {
  /** Opacity of scanline overlay (default: 0.03) */
  opacity?: number;
}

export interface CornerBracketOptions {
  /** Opacity of corner brackets (default: 0.15) */
  opacity?: number;
  /** Stroke width in pixels (default: 2) */
  strokeWidth?: number;
}

export interface RadialGlowOptions {
  /** Vertical center as SVG percentage (default: "35%") */
  cy?: string;
  /** Opacity of radial glow (default: 0.15) */
  opacity?: number;
  /** Radius as SVG percentage (default: "50%") */
  r?: string;
}

export interface StyleConfig {
  /** Pixel-art corner frame brackets */
  cornerBrackets?: boolean | CornerBracketOptions;
  /** Font weight for the project name (default: 700) */
  nameFontWeight?: number;
  /** Letter spacing for the project name — number (px) or string with units e.g. "-0.0225em" (default: 2) */
  nameLetterSpacing?: number | string;
  /**
   * Base preset to start from. Can be:
   * - A built-in name: `"minimal"`, `"terminal"`
   * - Any registered custom preset name (see `registerPreset()`)
   * - An inline `Preset` object (no registration needed)
   *
   * The preset provides default decorations and optional color overrides.
   * Explicit `scanlines`, `cornerBrackets`, `radialGlow`, and `colors`
   * fields on the config always take precedence over the preset.
   */
  preset?: string | import("./preset/presets.js").Preset;
  /** Radial gradient glow behind logo (default: on) */
  radialGlow?: boolean | RadialGlowOptions;
  /** Horizontal scanline overlay */
  scanlines?: boolean | ScanlineOptions;
}

// --- Main config ---

export interface OgImageConfig {
  /** Color configuration */
  colors?: ColorConfig;
  /** Longer description (used for meta tags, not rendered in image) */
  description?: string;
  /** Feature keywords displayed as pills */
  features?: string[];
  /** Font configuration */
  font?: FontConfig;
  /** Footer text (e.g. URL or version) */
  footer?: string;
  /** Image height in pixels (default: 630) */
  height?: number;
  /** URL where the generated image will be hosted (for meta tags) */
  imageUrl?: string;
  /** Logo configuration */
  logo?: LogoConfig;
  /** Project name (required) */
  name: string;
  /** Style/decoration configuration */
  style?: StyleConfig;
  /** Short tagline displayed below the name */
  tagline?: string;
  /** Canonical URL (used for meta tags) */
  url?: string;
  /** Image width in pixels (default: 1200) */
  width?: number;
}

// --- Generation result ---

export interface GenerateResult {
  /** Image height */
  height: number;
  /** Compressed PNG buffer */
  png: Buffer;
  /** PNG file size in bytes */
  pngSize: number;
  /** Raw SVG string */
  svg: string;
  /** Image width */
  width: number;
}

// --- Meta tags ---

export interface MetaTag {
  /** Tag attributes */
  attributes: Record<string, string>;
  /** Tag name, e.g. "meta" */
  tag: string;
}

export interface MetaTagsConfig {
  /** Page description */
  description?: string;
  /** Image height (default: 630) */
  imageHeight?: number;
  /** URL to the OG image */
  imageUrl: string;
  /** Image width (default: 1200) */
  imageWidth?: number;
  /** Locale (e.g. "en_US") */
  locale?: string;
  /** Site name (e.g. "GitHub") */
  siteName?: string;
  /** Page title */
  title: string;
  /** Canonical URL of the page */
  url?: string;
}

export interface MetaTagsResult {
  /** Full HTML string of meta tags */
  html: string;
  /** Structured array of tags */
  tags: MetaTag[];
}
