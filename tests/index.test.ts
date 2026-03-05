import { describe, expect, it } from "vitest";
import {
  buildSvg,
  calculateLayout,
  compressPng,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  definePreset,
  escapeSvgText,
  estimateTextWidth,
  extractSvgContent,
  generate,
  generateMetaTags,
  getBundledFontPaths,
  getFontFamily,
  getPreset,
  listPresetDetails,
  listPresets,
  loadFontBuffers,
  maxCharsForWidth,
  minimal,
  registerPreset,
  resolvePreset,
  terminal,
  truncateText,
} from "../src/index.js";

describe("barrel export (index.ts)", () => {
  it("exports generate function", () => {
    expect(typeof generate).toBe("function");
  });

  it("exports buildSvg function", () => {
    expect(typeof buildSvg).toBe("function");
  });

  it("exports generateMetaTags function", () => {
    expect(typeof generateMetaTags).toBe("function");
  });

  it("exports compressPng function", () => {
    expect(typeof compressPng).toBe("function");
  });

  it("exports font utilities", () => {
    expect(typeof loadFontBuffers).toBe("function");
    expect(typeof getBundledFontPaths).toBe("function");
    expect(typeof getFontFamily).toBe("function");
  });

  it("exports SVG utilities", () => {
    expect(typeof escapeSvgText).toBe("function");
    expect(typeof truncateText).toBe("function");
    expect(typeof estimateTextWidth).toBe("function");
    expect(typeof maxCharsForWidth).toBe("function");
    expect(typeof extractSvgContent).toBe("function");
  });

  it("exports layout constants and calculator", () => {
    expect(typeof calculateLayout).toBe("function");
    expect(DEFAULT_WIDTH).toBe(1200);
    expect(DEFAULT_HEIGHT).toBe(630);
  });

  it("exports preset system", () => {
    expect(typeof definePreset).toBe("function");
    expect(typeof registerPreset).toBe("function");
    expect(typeof getPreset).toBe("function");
    expect(typeof listPresets).toBe("function");
    expect(typeof listPresetDetails).toBe("function");
    expect(typeof resolvePreset).toBe("function");
    expect(minimal).toBeDefined();
    expect(terminal).toBeDefined();
  });
});
