#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Command } from "commander";
import { generate } from "./renderer/renderer.js";
import { generateMetaTags } from "./meta/meta-tags.js";
import { listPresetDetails } from "./preset/presets.js";
import type { OgImageConfig } from "./types.js";

const program = new Command();

program
  .name("og-image")
  .description(
    "Generate Open Graph images for link previews.\n\n" +
      "Quick start:\n" +
      "  og-image generate --name \"My Project\" --tagline \"A cool tool\"\n\n" +
      "From a config file:\n" +
      "  og-image generate --config og-image.json\n\n" +
      "List available style presets:\n" +
      "  og-image presets",
  )
  .version("0.1.0");

program
  .command("presets")
  .description("List all registered style presets with their descriptions")
  .action(() => {
    const presets = listPresetDetails();
    console.log("Available presets:\n");
    for (const p of presets) {
      const desc = p.description ? ` - ${p.description}` : "";
      const decorations: string[] = [];
      if (p.scanlines) decorations.push("scanlines");
      if (p.cornerBrackets) decorations.push("corner brackets");
      if (p.radialGlow) decorations.push("radial glow");
      const decoStr = decorations.length
        ? `  [${decorations.join(", ")}]`
        : "";
      console.log(`  ${p.name}${desc}${decoStr}`);
      if (p.colors) {
        const colorParts = Object.entries(p.colors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        console.log(`    colors: ${colorParts}`);
      }
    }
    console.log(
      "\nUsage:\n" +
        "  og-image generate --preset <name>\n" +
        "  og-image generate --config og-image.json  (with \"style\": { \"preset\": \"<name>\" })\n\n" +
        "Custom presets can be registered via the Node.js API.\n" +
        "See: https://github.com/ytspar/og-image-generator#custom-presets",
    );
  });

program
  .command("generate")
  .description(
    "Generate an OG image (1200x630 PNG) from options or a config file",
  )
  .option("--name <name>", "project name displayed in the image (required unless --config)")
  .option("--tagline <tagline>", "short tagline below the project name")
  .option(
    "--description <text>",
    "page description (used in meta tags, not rendered in image)",
  )
  .option(
    "--features <words...>",
    "feature keywords shown as a row (e.g. --features Fast Secure Scalable)",
  )
  .option("--footer <text>", "footer text, typically a URL or version string")
  .option("--bg <color>", "background hex color (default: #0a0a0a)")
  .option("--accent <color>", "accent hex color for project name (default: #22d3ee)")
  .option("--logo-svg <path>", "path to an SVG file to use as the logo")
  .option(
    "--font <path>",
    "path to a custom font file (TTF/OTF/WOFF2) for regular weight",
  )
  .option("-o, --output <path>", "output PNG file path (default: og-image.png)", "og-image.png")
  .option("--svg", "also write the raw SVG alongside the PNG")
  .option(
    "--meta",
    "print HTML meta tags (Open Graph + Twitter Card) to stdout",
  )
  .option("--url <url>", "canonical page URL (included in meta tags)")
  .option(
    "--image-url <url>",
    "public URL where the image will be hosted (for og:image meta tag)",
  )
  .option(
    "--config <path>",
    "path to a JSON config file (all other flags are ignored when set)",
  )
  .option(
    "--preset <name>",
    "style preset name — sets decorations and colors (see: og-image presets)",
  )
  .action(async (opts) => {
    let config: OgImageConfig;

    if (opts.config) {
      const raw = await readFile(resolve(opts.config), "utf-8");
      const parsed: unknown = JSON.parse(raw);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        typeof (parsed as Record<string, unknown>).name !== "string"
      ) {
        console.error(
          'Error: config file must be a JSON object with at least a "name" field.',
        );
        process.exit(1);
      }
      config = parsed as OgImageConfig;
    } else {
      if (!opts.name) {
        console.error(
          "Error: --name is required (or use --config <path>)\n\n" +
            "Examples:\n" +
            '  og-image generate --name "My Project"\n' +
            "  og-image generate --config og-image.json\n\n" +
            "Run og-image generate --help for all options.",
        );
        process.exit(1);
      }

      config = {
        name: opts.name,
        tagline: opts.tagline,
        description: opts.description,
        features: opts.features,
        footer: opts.footer,
        url: opts.url,
        imageUrl: opts.imageUrl,
        colors: {},
        style: {},
      };

      if (opts.bg) config.colors!.background = opts.bg;
      if (opts.accent) config.colors!.accent = opts.accent;
      if (opts.font) config.font = { path: opts.font };
      if (opts.logoSvg)
        config.logo = { type: "svg-file", path: opts.logoSvg };
      if (opts.preset) config.style!.preset = opts.preset;
    }

    const result = await generate(config);

    const outputPath = resolve(opts.output);
    await writeFile(outputPath, result.png);
    console.log(
      `PNG: ${outputPath} (${result.width}x${result.height}, ${(result.pngSize / 1024).toFixed(1)}KB)`,
    );

    if (opts.svg) {
      const svgPath = outputPath.replace(/\.png$/, ".svg");
      await writeFile(svgPath, result.svg, "utf-8");
      console.log(`SVG: ${svgPath}`);
    }

    if (opts.meta) {
      const metaConfig = {
        title: config.name,
        description: config.description ?? config.tagline,
        url: config.url,
        imageUrl: config.imageUrl ?? opts.imageUrl ?? "og-image.png",
        imageWidth: result.width,
        imageHeight: result.height,
      };
      const meta = generateMetaTags(metaConfig);
      console.log("\nMeta tags:\n" + meta.html);
    }
  });

program.parse();
