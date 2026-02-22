export interface CompressOptions {
  /** PNG compression level 0-9 (default: 9) */
  compressionLevel?: number;
  /** Use palette quantization for flat-color images (default: true) */
  palette?: boolean;
  /** Number of colors for palette mode (default: 256) */
  colors?: number;
}

export async function compressPng(
  buffer: Buffer,
  options?: CompressOptions,
): Promise<Buffer> {
  // Lazy-load native binary to avoid penalizing consumers who only need SVG/meta features
  const sharp = (await import("sharp")).default;

  const compressionLevel = options?.compressionLevel ?? 9;
  const palette = options?.palette ?? true;
  const colors = options?.colors ?? 256;

  const result = await sharp(buffer)
    .png({
      compressionLevel,
      palette,
      colors,
    })
    .toBuffer();

  return result;
}
