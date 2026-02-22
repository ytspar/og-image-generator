// --- Logo configuration ---

export interface LogoSvgInline {
  type: "svg-inline";
  /** Raw SVG content (inner elements, no <svg> wrapper needed) */
  content: string;
  /** viewBox dimensions, e.g. "0 0 100 100" */
  viewBox: string;
}

export interface LogoSvgFile {
  type: "svg-file";
  /** Path to SVG file */
  path: string;
  /** Optional CSS selector for a <g> element to extract (e.g. "#wordmark") */
  selector?: string;
}

export interface LogoText {
  type: "text";
  /** Text to display as logo fallback */
  text: string;
}

export type LogoConfig = LogoSvgInline | LogoSvgFile | LogoText;

// --- Color configuration ---

export interface ColorConfig {
  /** Background color (default: "#0a0a0a") */
  background?: string;
  /** Accent color for project name and highlights (default: "#22d3ee") */
  accent?: string;
  /** Dim color for secondary text (default: "#a1a1aa") */
  dim?: string;
  /** Primary text color (default: "#fafafa") */
  text?: string;
}

// --- Font configuration ---

export interface FontConfig {
  /** Path to regular weight font file (TTF, OTF, or WOFF2) */
  path?: string;
  /** Path to bold weight font file */
  boldPath?: string;
  /** Font family name (default: "Inter") */
  family?: string;
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
  /** Opacity of radial glow (default: 0.15) */
  opacity?: number;
  /** Vertical center as SVG percentage (default: "35%") */
  cy?: string;
  /** Radius as SVG percentage (default: "50%") */
  r?: string;
}

export interface StyleConfig {
  /** Horizontal scanline overlay */
  scanlines?: boolean | ScanlineOptions;
  /** Pixel-art corner frame brackets */
  cornerBrackets?: boolean | CornerBracketOptions;
  /** Radial gradient glow behind logo (default: on) */
  radialGlow?: boolean | RadialGlowOptions;
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
}

// --- Main config ---

export interface OgImageConfig {
  /** Project name (required) */
  name: string;
  /** Short tagline displayed below the name */
  tagline?: string;
  /** Longer description (used for meta tags, not rendered in image) */
  description?: string;
  /** Feature keywords displayed as pills */
  features?: string[];
  /** Footer text (e.g. URL or version) */
  footer?: string;
  /** Canonical URL (used for meta tags) */
  url?: string;
  /** URL where the generated image will be hosted (for meta tags) */
  imageUrl?: string;
  /** Logo configuration */
  logo?: LogoConfig;
  /** Color configuration */
  colors?: ColorConfig;
  /** Font configuration */
  font?: FontConfig;
  /** Style/decoration configuration */
  style?: StyleConfig;
  /** Image width in pixels (default: 1200) */
  width?: number;
  /** Image height in pixels (default: 630) */
  height?: number;
}

// --- Generation result ---

export interface GenerateResult {
  /** Raw SVG string */
  svg: string;
  /** Compressed PNG buffer */
  png: Buffer;
  /** PNG file size in bytes */
  pngSize: number;
  /** Image width */
  width: number;
  /** Image height */
  height: number;
}

// --- Meta tags ---

export interface MetaTag {
  /** Tag name, e.g. "meta" */
  tag: string;
  /** Tag attributes */
  attributes: Record<string, string>;
}

export interface MetaTagsConfig {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Canonical URL of the page */
  url?: string;
  /** URL to the OG image */
  imageUrl: string;
  /** Image width (default: 1200) */
  imageWidth?: number;
  /** Image height (default: 630) */
  imageHeight?: number;
  /** Site name (e.g. "GitHub") */
  siteName?: string;
  /** Locale (e.g. "en_US") */
  locale?: string;
}

export interface MetaTagsResult {
  /** Full HTML string of meta tags */
  html: string;
  /** Structured array of tags */
  tags: MetaTag[];
}
