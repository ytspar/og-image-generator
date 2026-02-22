import { describe, it, expect } from "vitest";
import { generate } from "../src/renderer/renderer.js";
import { generateMetaTags } from "../src/meta/meta-tags.js";
import type { OgImageConfig } from "../src/types.js";

describe("integration", () => {
  it("generates a complete OG image with hetzner-cli-like config", async () => {
    const config: OgImageConfig = {
      name: "hetzner-cli",
      tagline: "A modern CLI for Hetzner Cloud",
      features: ["Servers", "Firewalls", "Load Balancers", "SSH Keys"],
      footer: "github.com/hetzner/cli",
      colors: {
        background: "#0a0a0a",
        accent: "#d50c2d",
      },
      style: { preset: "terminal" },
    };

    const result = await generate(config);

    // Valid PNG
    expect(result.png[0]).toBe(0x89);
    expect(result.png[1]).toBe(0x50);

    // Correct dimensions
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);

    // SVG contains all content
    expect(result.svg).toContain("hetzner-cli");
    expect(result.svg).toContain("A modern CLI for Hetzner Cloud");
    expect(result.svg).toContain("Servers");
    expect(result.svg).toContain("github.com/hetzner/cli");

    // Terminal preset includes decorations
    expect(result.svg).toContain("scanlines");
    expect(result.svg).toContain("polyline");
    expect(result.svg).toContain("radialGradient");

    // Reasonable file size (should be under 100KB for flat colors)
    expect(result.pngSize).toBeLessThan(100_000);
    expect(result.pngSize).toBeGreaterThan(0);
  });

  it("generates a minimal OG image", async () => {
    const config: OgImageConfig = {
      name: "my-lib",
    };

    const result = await generate(config);

    expect(result.png[0]).toBe(0x89);
    expect(result.width).toBe(1200);
    expect(result.svg).toContain("my-lib");
    // Minimal preset: no scanlines/brackets
    expect(result.svg).not.toContain('id="scanlines"');
    expect(result.svg).not.toContain("polyline");
  });

  it("end-to-end with meta tags", async () => {
    const config: OgImageConfig = {
      name: "devbar",
      tagline: "Developer toolbar for macOS",
      description: "A developer toolbar for macOS with system monitoring",
      url: "https://devbar.app",
      imageUrl: "https://devbar.app/og.png",
      features: ["CPU", "Memory", "Network", "Disk"],
      style: { preset: "terminal" },
    };

    const result = await generate(config);
    expect(result.pngSize).toBeGreaterThan(0);

    const meta = generateMetaTags({
      title: config.name,
      description: config.description,
      url: config.url,
      imageUrl: config.imageUrl!,
      imageWidth: result.width,
      imageHeight: result.height,
    });

    expect(meta.html).toContain("devbar");
    expect(meta.html).toContain("https://devbar.app/og.png");
    expect(meta.html).toContain("1200");
    expect(meta.html).toContain("630");
    expect(meta.tags.length).toBeGreaterThan(10);
  });
});
