// Sub-module types re-exported for consumer convenience
export type { BundledFontPaths, FontBuffers } from "./font/font-loader.js";
export {
  getBundledFontPaths,
  getFontFamily,
  loadFontBuffers,
} from "./font/font-loader.js";
export { generateMetaTags } from "./meta/meta-tags.js";
export type { Preset } from "./preset/presets.js";
export {
  definePreset,
  getPreset,
  listPresetDetails,
  listPresets,
  minimal,
  registerPreset,
  resolvePreset,
  terminal,
} from "./preset/presets.js";
export type { CompressOptions } from "./renderer/compress.js";
export { compressPng } from "./renderer/compress.js";
export { generate } from "./renderer/renderer.js";
export type { LayoutInput, LayoutPositions } from "./template/layout.js";
export {
  calculateLayout,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
} from "./template/layout.js";
export type { ResolvedStyle } from "./template/svg-template.js";
export { buildSvg } from "./template/svg-template.js";
export type { ExtractedSvg } from "./template/svg-utils.js";
export {
  escapeSvgText,
  estimateTextWidth,
  extractSvgContent,
  maxCharsForWidth,
  truncateText,
} from "./template/svg-utils.js";
export type {
  ColorConfig,
  CornerBracketOptions,
  FontConfig,
  GenerateResult,
  LogoConfig,
  LogoSvgFile,
  LogoSvgInline,
  LogoText,
  MetaTag,
  MetaTagsConfig,
  MetaTagsResult,
  OgImageConfig,
  RadialGlowOptions,
  ScanlineOptions,
  StyleConfig,
} from "./types.js";
