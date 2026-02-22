import { readFile } from "node:fs/promises";

/** Escape text for safe embedding in SVG/XML */
export function escapeSvgText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Truncate text with ellipsis if it exceeds maxChars */
export function truncateText(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars - 1) + "\u2026";
}

/**
 * Estimate rendered text width for a proportional font.
 * Uses an average character width ratio of 0.55 * fontSize.
 */
export function estimateTextWidth(
  text: string,
  fontSize: number,
  charWidthRatio = 0.55,
): number {
  return text.length * fontSize * charWidthRatio;
}

/** Calculate how many characters fit in a given width */
export function maxCharsForWidth(
  width: number,
  fontSize: number,
  charWidthRatio = 0.55,
): number {
  return Math.floor(width / (fontSize * charWidthRatio));
}

export interface ExtractedSvg {
  content: string;
  viewBox: string;
  width: number;
  height: number;
}

/**
 * Extract SVG content from a file.
 * If selector is given (e.g. "wordmark"), extracts the <g id="wordmark"> group.
 * Otherwise returns the full inner content.
 */
export async function extractSvgContent(
  filePath: string,
  selector?: string,
): Promise<ExtractedSvg> {
  const svg = await readFile(filePath, "utf-8");

  // Extract viewBox
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch?.[1] ?? "0 0 100 100";
  const [, , vbW, vbH] = viewBox.split(/\s+/).map(Number);

  if (selector) {
    // Extract a specific group by id
    const groupRegex = new RegExp(
      `<g[^>]*id="${selector}"[^>]*>([\\s\\S]*?)</g>`,
    );
    const match = svg.match(groupRegex);
    if (match) {
      return {
        content: match[0],
        viewBox,
        width: vbW ?? 100,
        height: vbH ?? 100,
      };
    }
  }

  // Extract everything between <svg ...> and </svg>
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  const content = innerMatch?.[1]?.trim() ?? "";

  return {
    content,
    viewBox,
    width: vbW ?? 100,
    height: vbH ?? 100,
  };
}
