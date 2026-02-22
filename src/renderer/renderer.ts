import type { OgImageConfig, GenerateResult } from "../types.js";
import { buildSvg } from "../template/svg-template.js";
import { loadFontBuffers, getFontFamily } from "../font/font-loader.js";
import { compressPng } from "./compress.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../template/layout.js";

export async function generate(config: OgImageConfig): Promise<GenerateResult> {
  const width = config.width ?? DEFAULT_WIDTH;
  const height = config.height ?? DEFAULT_HEIGHT;
  const fontFamily = getFontFamily(config.font);

  // Build SVG
  const svg = buildSvg(config);

  // Load fonts
  const fonts = await loadFontBuffers(config.font);

  // Lazy-load native binary to avoid penalizing consumers who only need SVG/meta features
  const { Resvg } = await import("@resvg/resvg-js");

  // Render with resvg
  // fontBuffers is supported at runtime but missing from @resvg/resvg-js type definitions
  const resvgOpts = {
    fitTo: { mode: "width" as const, value: width },
    font: {
      fontBuffers: [fonts.regular, fonts.bold],
      defaultFontFamily: fontFamily,
    },
  };
  const resvg = new Resvg(svg, resvgOpts as ConstructorParameters<typeof Resvg>[1]);

  const rendered = resvg.render();
  const rawPng = rendered.asPng();

  // Compress
  const png = await compressPng(Buffer.from(rawPng));

  return {
    svg,
    png,
    pngSize: png.length,
    width,
    height,
  };
}
