export { generate } from "./renderer/renderer.js";
export { buildSvg } from "./template/svg-template.js";
export { generateMetaTags } from "./meta/meta-tags.js";
export { compressPng } from "./renderer/compress.js";
export { loadFontBuffers, getBundledFontPaths, getFontFamily } from "./font/font-loader.js";
export { escapeSvgText, truncateText, estimateTextWidth, maxCharsForWidth, extractSvgContent } from "./template/svg-utils.js";
export { calculateLayout, DEFAULT_WIDTH, DEFAULT_HEIGHT } from "./template/layout.js";
export {
  definePreset,
  registerPreset,
  getPreset,
  listPresets,
  listPresetDetails,
  resolvePreset,
  minimal,
  terminal,
} from "./preset/presets.js";
export type { Preset } from "./preset/presets.js";

export type {
  OgImageConfig,
  LogoConfig,
  LogoSvgInline,
  LogoSvgFile,
  LogoText,
  ColorConfig,
  FontConfig,
  StyleConfig,
  ScanlineOptions,
  CornerBracketOptions,
  RadialGlowOptions,
  GenerateResult,
  MetaTagsConfig,
  MetaTagsResult,
  MetaTag,
} from "./types.js";

// Sub-module types re-exported for consumer convenience
export type { BundledFontPaths, FontBuffers } from "./font/font-loader.js";
export type { CompressOptions } from "./renderer/compress.js";
export type { ExtractedSvg } from "./template/svg-utils.js";
export type { ResolvedStyle } from "./template/svg-template.js";
export type { LayoutPositions, LayoutInput } from "./template/layout.js";
