import { describe, it, expect } from "vitest";
import * as api from "../src/index.js";

describe("barrel export (index.ts)", () => {
  it("exports generate function", () => {
    expect(typeof api.generate).toBe("function");
  });

  it("exports buildSvg function", () => {
    expect(typeof api.buildSvg).toBe("function");
  });

  it("exports generateMetaTags function", () => {
    expect(typeof api.generateMetaTags).toBe("function");
  });

  it("exports compressPng function", () => {
    expect(typeof api.compressPng).toBe("function");
  });

  it("exports font utilities", () => {
    expect(typeof api.loadFontBuffers).toBe("function");
    expect(typeof api.getBundledFontPaths).toBe("function");
    expect(typeof api.getFontFamily).toBe("function");
  });

  it("exports SVG utilities", () => {
    expect(typeof api.escapeSvgText).toBe("function");
    expect(typeof api.truncateText).toBe("function");
    expect(typeof api.estimateTextWidth).toBe("function");
    expect(typeof api.maxCharsForWidth).toBe("function");
    expect(typeof api.extractSvgContent).toBe("function");
  });

  it("exports layout constants and calculator", () => {
    expect(typeof api.calculateLayout).toBe("function");
    expect(api.DEFAULT_WIDTH).toBe(1200);
    expect(api.DEFAULT_HEIGHT).toBe(630);
  });

  it("exports preset system", () => {
    expect(typeof api.definePreset).toBe("function");
    expect(typeof api.registerPreset).toBe("function");
    expect(typeof api.getPreset).toBe("function");
    expect(typeof api.listPresets).toBe("function");
    expect(typeof api.listPresetDetails).toBe("function");
    expect(typeof api.resolvePreset).toBe("function");
    expect(api.minimal).toBeDefined();
    expect(api.terminal).toBeDefined();
  });
});
