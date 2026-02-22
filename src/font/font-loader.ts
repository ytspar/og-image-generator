import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { FontConfig } from "../types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, "..", "..", "fonts");

export interface BundledFontPaths {
  regular: string;
  bold: string;
}

export function getBundledFontPaths(): BundledFontPaths {
  return {
    regular: join(FONTS_DIR, "Inter-Regular.woff2"),
    bold: join(FONTS_DIR, "Inter-Bold.woff2"),
  };
}

export interface FontBuffers {
  regular: Buffer;
  bold: Buffer;
}

export async function loadFontBuffers(
  config?: FontConfig,
): Promise<FontBuffers> {
  const bundled = getBundledFontPaths();

  const regularPath = config?.path ?? bundled.regular;
  const boldPath = config?.boldPath ?? bundled.bold;

  const [regular, bold] = await Promise.all([
    readFile(regularPath),
    readFile(boldPath),
  ]);

  return { regular, bold };
}

export function getFontFamily(config?: FontConfig): string {
  return config?.family ?? "Inter";
}
