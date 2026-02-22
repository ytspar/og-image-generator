import { describe, it, expect } from "vitest";
import { generate } from "../src/renderer/renderer.js";

describe("renderer", () => {
  it("produces a valid PNG buffer", async () => {
    const result = await generate({ name: "Test" });

    // PNG magic bytes: 137 80 78 71 13 10 26 10
    expect(result.png[0]).toBe(0x89);
    expect(result.png[1]).toBe(0x50); // P
    expect(result.png[2]).toBe(0x4e); // N
    expect(result.png[3]).toBe(0x47); // G

    expect(result.pngSize).toBeGreaterThan(0);
    expect(result.pngSize).toBe(result.png.length);
  });

  it("returns correct dimensions", async () => {
    const result = await generate({ name: "Test" });
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
  });

  it("returns SVG string", async () => {
    const result = await generate({ name: "Test" });
    expect(result.svg).toContain("<svg");
    expect(result.svg).toContain("Test");
  });

  it("supports custom dimensions", async () => {
    const result = await generate({
      name: "Test",
      width: 800,
      height: 400,
    });
    expect(result.width).toBe(800);
    expect(result.height).toBe(400);
  });
});
