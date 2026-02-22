import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import {
  getBundledFontPaths,
  loadFontBuffers,
  getFontFamily,
} from "../src/font/font-loader.js";

describe("getBundledFontPaths", () => {
  it("returns paths to regular and bold fonts", () => {
    const paths = getBundledFontPaths();
    expect(paths.regular).toContain("Inter-Regular.woff2");
    expect(paths.bold).toContain("Inter-Bold.woff2");
  });

  it("bundled font files exist on disk", () => {
    const paths = getBundledFontPaths();
    expect(existsSync(paths.regular)).toBe(true);
    expect(existsSync(paths.bold)).toBe(true);
  });
});

describe("loadFontBuffers", () => {
  it("loads bundled font buffers", async () => {
    const buffers = await loadFontBuffers();
    expect(Buffer.isBuffer(buffers.regular)).toBe(true);
    expect(Buffer.isBuffer(buffers.bold)).toBe(true);
    expect(buffers.regular.length).toBeGreaterThan(1000);
    expect(buffers.bold.length).toBeGreaterThan(1000);
  });

  it("uses custom font path when provided", async () => {
    const paths = getBundledFontPaths();
    // Use the bundled fonts as "custom" to test the override path
    const buffers = await loadFontBuffers({
      path: paths.regular,
      boldPath: paths.bold,
    });
    expect(Buffer.isBuffer(buffers.regular)).toBe(true);
  });
});

describe("getFontFamily", () => {
  it("defaults to Inter", () => {
    expect(getFontFamily()).toBe("Inter");
  });

  it("returns custom family when provided", () => {
    expect(getFontFamily({ family: "Departure Mono" })).toBe("Departure Mono");
  });
});
