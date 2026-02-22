import { describe, it, expect } from "vitest";
import sharp from "sharp";
import { compressPng } from "../src/renderer/compress.js";

describe("compressPng", () => {
  it("compresses a PNG buffer", async () => {
    // Create a simple uncompressed PNG via sharp
    const raw = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 255, g: 0, b: 0, alpha: 1 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();

    const compressed = await compressPng(raw);

    // Compressed should be smaller or equal (for tiny images may be similar)
    expect(compressed.length).toBeLessThanOrEqual(raw.length);

    // Should still be valid PNG
    expect(compressed[0]).toBe(0x89);
    expect(compressed[1]).toBe(0x50);
    expect(compressed[2]).toBe(0x4e);
    expect(compressed[3]).toBe(0x47);
  });

  it("accepts custom compression options", async () => {
    const raw = await sharp({
      create: {
        width: 50,
        height: 50,
        channels: 4,
        background: { r: 0, g: 0, b: 255, alpha: 1 },
      },
    })
      .png({ compressionLevel: 0 })
      .toBuffer();

    const compressed = await compressPng(raw, {
      compressionLevel: 6,
      palette: false,
    });

    expect(compressed[0]).toBe(0x89);
  });
});
