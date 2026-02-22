import { describe, it, expect } from "vitest";
import { generateMetaTags } from "../src/meta/meta-tags.js";

describe("generateMetaTags", () => {
  const baseConfig = {
    title: "My Project",
    description: "A cool project",
    url: "https://example.com",
    imageUrl: "https://example.com/og.png",
  };

  it("generates all required OG tags", () => {
    const result = generateMetaTags(baseConfig);

    expect(result.html).toContain('property="og:title"');
    expect(result.html).toContain('property="og:description"');
    expect(result.html).toContain('property="og:type"');
    expect(result.html).toContain('property="og:url"');
    expect(result.html).toContain('property="og:image"');
    expect(result.html).toContain('property="og:image:width"');
    expect(result.html).toContain('property="og:image:height"');
    expect(result.html).toContain('property="og:image:type"');
  });

  it("generates Twitter Card tags", () => {
    const result = generateMetaTags(baseConfig);

    expect(result.html).toContain('name="twitter:card"');
    expect(result.html).toContain("summary_large_image");
    expect(result.html).toContain('name="twitter:title"');
    expect(result.html).toContain('name="twitter:image"');
  });

  it("includes description in Twitter tags when provided", () => {
    const result = generateMetaTags(baseConfig);
    expect(result.html).toContain('name="twitter:description"');
  });

  it("resolves relative image URLs against base URL", () => {
    const result = generateMetaTags({
      title: "Test",
      imageUrl: "og.png",
      url: "https://example.com/projects/my-app",
    });

    const imageTag = result.tags.find(
      (t) => t.attributes.property === "og:image",
    );
    expect(imageTag?.attributes.content).toBe(
      "https://example.com/projects/my-app/og.png",
    );
  });

  it("uses absolute image URL as-is", () => {
    const result = generateMetaTags({
      title: "Test",
      imageUrl: "https://cdn.example.com/og.png",
      url: "https://example.com",
    });

    const imageTag = result.tags.find(
      (t) => t.attributes.property === "og:image",
    );
    expect(imageTag?.attributes.content).toBe(
      "https://cdn.example.com/og.png",
    );
  });

  it("escapes HTML attributes", () => {
    const result = generateMetaTags({
      title: 'A "quoted" & <title>',
      imageUrl: "https://example.com/og.png",
    });

    expect(result.html).toContain("&quot;");
    expect(result.html).toContain("&amp;");
    expect(result.html).toContain("&lt;");
  });

  it("includes optional site_name and locale", () => {
    const result = generateMetaTags({
      ...baseConfig,
      siteName: "MySite",
      locale: "en_US",
    });

    expect(result.html).toContain('property="og:site_name"');
    expect(result.html).toContain("MySite");
    expect(result.html).toContain('property="og:locale"');
    expect(result.html).toContain("en_US");
  });

  it("uses default dimensions 1200x630", () => {
    const result = generateMetaTags(baseConfig);

    const widthTag = result.tags.find(
      (t) => t.attributes.property === "og:image:width",
    );
    const heightTag = result.tags.find(
      (t) => t.attributes.property === "og:image:height",
    );
    expect(widthTag?.attributes.content).toBe("1200");
    expect(heightTag?.attributes.content).toBe("630");
  });

  it("returns structured tags array", () => {
    const result = generateMetaTags(baseConfig);
    expect(result.tags.length).toBeGreaterThan(0);
    expect(result.tags[0]).toHaveProperty("tag", "meta");
    expect(result.tags[0]).toHaveProperty("attributes");
  });

  it("omits description tags when not provided", () => {
    const result = generateMetaTags({
      title: "Test",
      imageUrl: "https://example.com/og.png",
    });

    expect(result.html).not.toContain('property="og:description"');
    expect(result.html).not.toContain('name="twitter:description"');
  });
});
