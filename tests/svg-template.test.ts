import { describe, it, expect } from "vitest";
import { buildSvg } from "../src/template/svg-template.js";
import type { OgImageConfig } from "../src/types.js";

describe("buildSvg", () => {
  const minConfig: OgImageConfig = {
    name: "TestProject",
  };

  it("produces valid SVG with required fields only", () => {
    const svg = buildSvg(minConfig);
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain('width="1200"');
    expect(svg).toContain('height="630"');
    expect(svg).toContain("TestProject");
  });

  it("uses default colors", () => {
    const svg = buildSvg(minConfig);
    expect(svg).toContain("#0a0a0a"); // background
    expect(svg).toContain("#22d3ee"); // accent
  });

  it("applies custom colors", () => {
    const svg = buildSvg({
      name: "Test",
      colors: { background: "#1a1a2e", accent: "#e94560" },
    });
    expect(svg).toContain("#1a1a2e");
    expect(svg).toContain("#e94560");
  });

  it("includes tagline when provided", () => {
    const svg = buildSvg({
      name: "Test",
      tagline: "A great project",
    });
    expect(svg).toContain("A great project");
  });

  it("includes features when provided", () => {
    const svg = buildSvg({
      name: "Test",
      features: ["Fast", "Secure", "Scalable"],
    });
    expect(svg).toContain("Fast");
    expect(svg).toContain("Secure");
    expect(svg).toContain("Scalable");
    expect(svg).toContain("|");
  });

  it("includes footer when provided", () => {
    const svg = buildSvg({
      name: "Test",
      footer: "https://example.com",
    });
    expect(svg).toContain("https://example.com");
  });

  it("escapes special characters in text", () => {
    const svg = buildSvg({
      name: "A & B <C>",
      tagline: '"quoted" & \'escaped\'',
    });
    expect(svg).toContain("&amp;");
    expect(svg).toContain("&lt;");
    expect(svg).toContain("&gt;");
    expect(svg).toContain("&quot;");
    expect(svg).toContain("&apos;");
    expect(svg).not.toContain("<C>");
  });

  it("truncates long text", () => {
    const longName = "A".repeat(200);
    const svg = buildSvg({ name: longName });
    // Should not contain 200 A's — truncated
    expect(svg).not.toContain("A".repeat(200));
    expect(svg).toContain("\u2026");
  });

  it("includes radial glow by default (minimal preset)", () => {
    const svg = buildSvg(minConfig);
    expect(svg).toContain("radialGradient");
    expect(svg).toContain('id="glow"');
  });

  it("does not include scanlines or brackets by default", () => {
    const svg = buildSvg(minConfig);
    expect(svg).not.toContain('id="scanlines"');
    expect(svg).not.toContain("polyline");
  });

  it("includes scanlines and brackets with terminal preset", () => {
    const svg = buildSvg({
      name: "Test",
      style: { preset: "terminal" },
    });
    expect(svg).toContain('id="scanlines"');
    expect(svg).toContain("polyline");
    expect(svg).toContain("radialGradient");
  });

  it("allows explicit style overrides", () => {
    const svg = buildSvg({
      name: "Test",
      style: {
        scanlines: { opacity: 0.1 },
        cornerBrackets: true,
        radialGlow: false,
      },
    });
    expect(svg).toContain('id="scanlines"');
    expect(svg).toContain("0.1");
    expect(svg).toContain("polyline");
    expect(svg).not.toContain("radialGradient");
  });

  it("renders inline SVG logo", () => {
    const svg = buildSvg({
      name: "Test",
      logo: {
        type: "svg-inline",
        content: '<circle cx="50" cy="50" r="50" fill="red"/>',
        viewBox: "0 0 100 100",
      },
    });
    expect(svg).toContain('viewBox="0 0 100 100"');
    expect(svg).toContain("circle");
  });

  it("renders text logo", () => {
    const svg = buildSvg({
      name: "Test",
      logo: { type: "text", text: "TT" },
    });
    expect(svg).toContain("TT");
  });

  it("uses custom dimensions", () => {
    const svg = buildSvg({
      name: "Test",
      width: 800,
      height: 400,
    });
    expect(svg).toContain('width="800"');
    expect(svg).toContain('height="400"');
  });
});
