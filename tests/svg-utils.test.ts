import { describe, it, expect } from "vitest";
import { writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import {
  escapeSvgText,
  truncateText,
  estimateTextWidth,
  maxCharsForWidth,
  extractSvgContent,
} from "../src/template/svg-utils.js";

describe("escapeSvgText", () => {
  it("escapes ampersand", () => {
    expect(escapeSvgText("A & B")).toBe("A &amp; B");
  });

  it("escapes angle brackets", () => {
    expect(escapeSvgText("<script>")).toBe("&lt;script&gt;");
  });

  it("escapes quotes", () => {
    expect(escapeSvgText(`He said "hello" & 'bye'`)).toBe(
      "He said &quot;hello&quot; &amp; &apos;bye&apos;",
    );
  });

  it("returns unchanged text when no special chars", () => {
    expect(escapeSvgText("Hello World")).toBe("Hello World");
  });

  it("handles empty string", () => {
    expect(escapeSvgText("")).toBe("");
  });
});

describe("truncateText", () => {
  it("returns text unchanged if within limit", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis when exceeding limit", () => {
    const result = truncateText("Hello World", 6);
    expect(result).toBe("Hello\u2026");
    expect(result.length).toBe(6);
  });

  it("handles exact length", () => {
    expect(truncateText("abc", 3)).toBe("abc");
  });
});

describe("estimateTextWidth", () => {
  it("estimates width based on char count and font size", () => {
    // 5 chars * 16px * 0.55 = 44
    expect(estimateTextWidth("hello", 16)).toBe(44);
  });

  it("uses custom char width ratio", () => {
    expect(estimateTextWidth("ab", 10, 0.6)).toBe(12);
  });
});

describe("maxCharsForWidth", () => {
  it("calculates max chars that fit in width", () => {
    // 100 / (16 * 0.55) = 11.36 -> floor = 11
    expect(maxCharsForWidth(100, 16)).toBe(11);
  });

  it("uses custom ratio", () => {
    // 100 / (10 * 0.6) = 16.67 -> 16
    expect(maxCharsForWidth(100, 10, 0.6)).toBe(16);
  });
});

describe("extractSvgContent", () => {
  const tempDir = tmpdir();

  it("extracts inner SVG content", async () => {
    const svgPath = join(tempDir, "test-extract.svg");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect width="200" height="100" fill="red"/>
  <circle cx="100" cy="50" r="40"/>
</svg>`;
    await writeFile(svgPath, svg, "utf-8");

    const result = await extractSvgContent(svgPath);
    expect(result.viewBox).toBe("0 0 200 100");
    expect(result.width).toBe(200);
    expect(result.height).toBe(100);
    expect(result.content).toContain("rect");
    expect(result.content).toContain("circle");

    await unlink(svgPath);
  });

  it("extracts a specific group by id", async () => {
    const svgPath = join(tempDir, "test-extract-group.svg");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150">
  <g id="bg"><rect width="300" height="150" fill="blue"/></g>
  <g id="wordmark"><text x="10" y="50">Logo</text></g>
</svg>`;
    await writeFile(svgPath, svg, "utf-8");

    const result = await extractSvgContent(svgPath, "wordmark");
    expect(result.content).toContain("wordmark");
    expect(result.content).toContain("Logo");
    expect(result.content).not.toContain("bg");

    await unlink(svgPath);
  });
});
