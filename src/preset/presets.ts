import type {
  ColorConfig,
  ScanlineOptions,
  CornerBracketOptions,
  RadialGlowOptions,
} from "../types.js";

// --- Preset definition ---

/**
 * A preset bundles style decorations and optional color overrides into a
 * reusable configuration that can be referenced by name.
 *
 * ## Defining a preset
 *
 * ```ts
 * import { definePreset } from "og-image-generator";
 *
 * const neon = definePreset({
 *   name: "neon",
 *   description: "Vibrant neon glow on dark background",
 *   colors: {
 *     background: "#0d0221",
 *     accent: "#ff00ff",
 *     dim: "#b967ff",
 *     text: "#fffce1",
 *   },
 *   scanlines: { opacity: 0.04 },
 *   cornerBrackets: false,
 *   radialGlow: { opacity: 0.25, cy: "40%", r: "55%" },
 * });
 * ```
 *
 * ## Registering for CLI / name-based lookup
 *
 * ```ts
 * import { registerPreset } from "og-image-generator";
 *
 * registerPreset(neon);
 *
 * // Now usable via: og-image generate --preset neon
 * // Or in config:   { "style": { "preset": "neon" } }
 * ```
 *
 * ## Using directly (no registration needed)
 *
 * ```ts
 * import { generate } from "og-image-generator";
 *
 * await generate({
 *   name: "My Project",
 *   style: { preset: neon },
 * });
 * ```
 */
export interface Preset {
  /** Unique preset name (used for CLI --preset and config files) */
  name: string;
  /** Short human-readable description */
  description?: string;
  /** Color overrides applied when this preset is active.
   *  Individual color fields are optional — omitted fields keep their defaults. */
  colors?: ColorConfig;
  /** Scanline overlay. `false` = off, `true` = default options, or provide options. */
  scanlines?: boolean | ScanlineOptions;
  /** Corner bracket frame. `false` = off, `true` = default options, or provide options. */
  cornerBrackets?: boolean | CornerBracketOptions;
  /** Radial glow behind logo. `false` = off, `true` = default options, or provide options. */
  radialGlow?: boolean | RadialGlowOptions;
}

// --- Built-in presets ---

/**
 * Minimal preset: clean background with a subtle radial glow. No scanlines or brackets.
 * This is the default when no preset is specified.
 */
export const minimal: Preset = {
  name: "minimal",
  description: "Clean background with subtle radial glow",
  scanlines: false,
  cornerBrackets: false,
  radialGlow: { opacity: 0.15, cy: "35%", r: "50%" },
};

/**
 * Terminal preset: retro terminal aesthetic with scanlines, corner brackets, and glow.
 * Reproduces the hetzner-cli / devbar style.
 */
export const terminal: Preset = {
  name: "terminal",
  description: "Retro terminal with scanlines, corner brackets, and glow",
  scanlines: { opacity: 0.03 },
  cornerBrackets: { opacity: 0.15, strokeWidth: 2 },
  radialGlow: { opacity: 0.15, cy: "35%", r: "50%" },
};

// --- Preset registry ---

const registry = new Map<string, Preset>();

// Register built-ins
registry.set("minimal", minimal);
registry.set("terminal", terminal);

/**
 * Create a new preset. This is a type-safe identity function that validates
 * the shape at compile time and returns the preset object unchanged.
 *
 * Does NOT register the preset — call `registerPreset()` if you want it
 * available by name in configs and the CLI.
 */
export function definePreset(preset: Preset): Preset {
  return preset;
}

/**
 * Register a preset so it can be referenced by name in `style.preset`
 * strings, JSON config files, and the CLI `--preset` flag.
 *
 * @throws if a preset with the same name is already registered
 *
 * ```ts
 * registerPreset(definePreset({
 *   name: "corporate",
 *   description: "Clean corporate look",
 *   colors: { background: "#ffffff", accent: "#0066cc", dim: "#666666", text: "#111111" },
 *   radialGlow: { opacity: 0.08 },
 * }));
 * ```
 */
export function registerPreset(preset: Preset): void {
  if (registry.has(preset.name)) {
    throw new Error(
      `Preset "${preset.name}" is already registered. Use a different name.`,
    );
  }
  registry.set(preset.name, preset);
}

/**
 * Look up a preset by name. Returns `undefined` if not found.
 */
export function getPreset(name: string): Preset | undefined {
  return registry.get(name);
}

/**
 * List all registered preset names.
 */
export function listPresets(): string[] {
  return [...registry.keys()];
}

/**
 * List all registered presets with their full definitions.
 */
export function listPresetDetails(): Preset[] {
  return [...registry.values()];
}

/**
 * Resolve a preset reference (name string or inline Preset object) to a Preset.
 *
 * @throws if a string name is given that isn't registered
 */
export function resolvePreset(ref: string | Preset | undefined): Preset {
  if (ref === undefined) {
    return minimal;
  }
  if (typeof ref === "string") {
    const preset = registry.get(ref);
    if (!preset) {
      const available = listPresets().join(", ");
      throw new Error(
        `Unknown preset "${ref}". Available presets: ${available}`,
      );
    }
    return preset;
  }
  return ref;
}
