import { describe, it, expect } from "vitest";
import {
  definePreset,
  registerPreset,
  getPreset,
  listPresets,
  listPresetDetails,
  resolvePreset,
  minimal,
  terminal,
} from "../src/preset/presets.js";
import { buildSvg } from "../src/template/svg-template.js";
import { resolveStyle } from "../src/template/svg-template.js";

describe("definePreset", () => {
  it("returns the same preset object", () => {
    const preset = definePreset({
      name: "test",
      description: "A test preset",
      scanlines: { opacity: 0.05 },
      cornerBrackets: false,
      radialGlow: true,
    });

    expect(preset.name).toBe("test");
    expect(preset.description).toBe("A test preset");
    expect(preset.scanlines).toEqual({ opacity: 0.05 });
    expect(preset.cornerBrackets).toBe(false);
    expect(preset.radialGlow).toBe(true);
  });

  it("allows color overrides in preset", () => {
    const preset = definePreset({
      name: "branded",
      colors: {
        background: "#1a1a2e",
        accent: "#e94560",
      },
      radialGlow: { opacity: 0.2 },
    });

    expect(preset.colors?.background).toBe("#1a1a2e");
    expect(preset.colors?.accent).toBe("#e94560");
  });
});

describe("built-in presets", () => {
  it("has minimal preset", () => {
    expect(minimal.name).toBe("minimal");
    expect(minimal.scanlines).toBe(false);
    expect(minimal.cornerBrackets).toBe(false);
    expect(minimal.radialGlow).toBeTruthy();
  });

  it("has terminal preset", () => {
    expect(terminal.name).toBe("terminal");
    expect(terminal.scanlines).toBeTruthy();
    expect(terminal.cornerBrackets).toBeTruthy();
    expect(terminal.radialGlow).toBeTruthy();
  });
});

describe("registerPreset / getPreset / listPresets", () => {
  it("built-in presets are registered", () => {
    expect(getPreset("minimal")).toBe(minimal);
    expect(getPreset("terminal")).toBe(terminal);
  });

  it("listPresets includes built-ins", () => {
    const names = listPresets();
    expect(names).toContain("minimal");
    expect(names).toContain("terminal");
  });

  it("listPresetDetails returns full objects", () => {
    const details = listPresetDetails();
    expect(details.length).toBeGreaterThanOrEqual(2);
    expect(details.find((p) => p.name === "minimal")).toBeTruthy();
  });

  it("registerPreset makes preset available by name", () => {
    const neon = definePreset({
      name: "neon-test",
      description: "Neon test preset",
      colors: { accent: "#ff00ff" },
      scanlines: { opacity: 0.04 },
      radialGlow: { opacity: 0.25 },
    });

    registerPreset(neon);
    expect(getPreset("neon-test")).toBe(neon);
    expect(listPresets()).toContain("neon-test");
  });

  it("throws on duplicate registration", () => {
    expect(() =>
      registerPreset(definePreset({ name: "minimal" })),
    ).toThrow(/already registered/);
  });

  it("getPreset returns undefined for unknown names", () => {
    expect(getPreset("nonexistent")).toBeUndefined();
  });
});

describe("resolvePreset", () => {
  it("defaults to minimal when undefined", () => {
    expect(resolvePreset(undefined)).toBe(minimal);
  });

  it("resolves string name to registered preset", () => {
    expect(resolvePreset("terminal")).toBe(terminal);
  });

  it("returns inline Preset object as-is", () => {
    const custom = definePreset({
      name: "inline",
      scanlines: true,
    });
    expect(resolvePreset(custom)).toBe(custom);
  });

  it("throws for unknown string name", () => {
    expect(() => resolvePreset("nonexistent-preset")).toThrow(
      /Unknown preset/,
    );
  });
});

describe("preset integration with buildSvg", () => {
  it("applies preset colors to SVG", () => {
    const branded = definePreset({
      name: "branded-svg-test",
      colors: { background: "#1a1a2e", accent: "#e94560" },
      radialGlow: { opacity: 0.2 },
    });

    const svg = buildSvg({
      name: "Test",
      style: { preset: branded },
    });

    expect(svg).toContain("#1a1a2e"); // preset background
    expect(svg).toContain("#e94560"); // preset accent
  });

  it("explicit config colors override preset colors", () => {
    const branded = definePreset({
      name: "branded-override-test",
      colors: { background: "#1a1a2e", accent: "#e94560" },
    });

    const svg = buildSvg({
      name: "Test",
      style: { preset: branded },
      colors: { accent: "#00ff00" },
    });

    expect(svg).toContain("#1a1a2e"); // preset background still applied
    expect(svg).toContain("#00ff00"); // config accent overrides preset
    expect(svg).not.toContain("#e94560"); // preset accent replaced
  });

  it("explicit style decorations override preset", () => {
    // Terminal preset has scanlines on
    const svg = buildSvg({
      name: "Test",
      style: {
        preset: "terminal",
        scanlines: false, // explicitly turn off
      },
    });

    expect(svg).not.toContain('id="scanlines"');
    expect(svg).toContain("polyline"); // brackets still from preset
  });

  it("string preset name works in config", () => {
    const svg = buildSvg({
      name: "Test",
      style: { preset: "terminal" },
    });
    expect(svg).toContain('id="scanlines"');
    expect(svg).toContain("polyline");
  });
});

describe("resolveStyle", () => {
  it("returns preset colors in resolved style", () => {
    const preset = definePreset({
      name: "color-test",
      colors: { background: "#111", accent: "#222" },
    });

    const resolved = resolveStyle({ preset });
    expect(resolved.colors).toEqual({ background: "#111", accent: "#222" });
  });

  it("returns empty colors when preset has none", () => {
    const resolved = resolveStyle({ preset: "minimal" });
    expect(resolved.colors).toEqual({});
  });

  it("defaults to minimal when style is undefined", () => {
    const resolved = resolveStyle(undefined);
    expect(resolved.scanlines).toBe(false);
    expect(resolved.cornerBrackets).toBe(false);
    expect(resolved.radialGlow).not.toBe(false);
  });

  it("defaults to minimal when style is empty object", () => {
    const resolved = resolveStyle({});
    expect(resolved.scanlines).toBe(false);
    expect(resolved.cornerBrackets).toBe(false);
    expect(resolved.radialGlow).not.toBe(false);
  });

  it("explicit false overrides preset true", () => {
    const resolved = resolveStyle({
      preset: "terminal",
      scanlines: false,
      cornerBrackets: false,
    });
    expect(resolved.scanlines).toBe(false);
    expect(resolved.cornerBrackets).toBe(false);
    // radialGlow not overridden, should still be on from terminal preset
    expect(resolved.radialGlow).not.toBe(false);
  });

  it("explicit true overrides preset false", () => {
    // minimal has scanlines: false, cornerBrackets: false
    const resolved = resolveStyle({
      preset: "minimal",
      scanlines: true,
      cornerBrackets: true,
    });
    expect(resolved.scanlines).toEqual({ opacity: 0.03 });
    expect(resolved.cornerBrackets).toEqual({
      opacity: 0.15,
      strokeWidth: 2,
    });
  });

  it("partial options merge with defaults", () => {
    const resolved = resolveStyle({
      scanlines: { opacity: 0.1 },
      radialGlow: { opacity: 0.5, cy: "50%", r: "40%" },
    });
    expect(resolved.scanlines).toEqual({ opacity: 0.1 });
    expect(resolved.radialGlow).toEqual({
      opacity: 0.5,
      cy: "50%",
      r: "40%",
    });
  });

  it("resolves terminal preset decorations", () => {
    const resolved = resolveStyle({ preset: "terminal" });
    expect(resolved.scanlines).toEqual({ opacity: 0.03 });
    expect(resolved.cornerBrackets).toEqual({
      opacity: 0.15,
      strokeWidth: 2,
    });
    expect(resolved.radialGlow).not.toBe(false);
  });
});
