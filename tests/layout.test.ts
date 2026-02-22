import { describe, it, expect } from "vitest";
import {
  calculateLayout,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
} from "../src/template/layout.js";

describe("calculateLayout", () => {
  it("returns default dimensions", () => {
    expect(DEFAULT_WIDTH).toBe(1200);
    expect(DEFAULT_HEIGHT).toBe(630);
  });

  it("centers content with all sections present", () => {
    const layout = calculateLayout({
      hasLogo: true,
      hasTagline: true,
      hasFeatures: true,
      hasFooter: true,
    });

    // All Y positions should be within the image bounds
    expect(layout.logoY).toBeGreaterThan(0);
    expect(layout.nameY).toBeGreaterThan(layout.logoY);
    expect(layout.taglineY).toBeGreaterThan(layout.nameY);
    expect(layout.featuresY).toBeGreaterThan(layout.taglineY);
    expect(layout.footerY).toBe(DEFAULT_HEIGHT - 40);
  });

  it("adjusts when no logo is present", () => {
    const withLogo = calculateLayout({
      hasLogo: true,
      hasTagline: true,
      hasFeatures: false,
      hasFooter: false,
    });

    const withoutLogo = calculateLayout({
      hasLogo: false,
      hasTagline: true,
      hasFeatures: false,
      hasFooter: false,
    });

    // Without logo, nameY is smaller because there's no logo+gap offset above it
    expect(withoutLogo.nameY).toBeLessThan(withLogo.nameY);
  });

  it("adjusts when no tagline is present", () => {
    const withTagline = calculateLayout({
      hasLogo: false,
      hasTagline: true,
      hasFeatures: true,
      hasFooter: false,
    });

    const withoutTagline = calculateLayout({
      hasLogo: false,
      hasTagline: false,
      hasFeatures: true,
      hasFooter: false,
    });

    // Without tagline, features should be closer to name
    expect(withoutTagline.featuresY).toBeLessThan(withTagline.featuresY);
  });

  it("uses custom height", () => {
    const layout = calculateLayout({
      hasLogo: false,
      hasTagline: false,
      hasFeatures: false,
      hasFooter: true,
      height: 400,
    });

    expect(layout.footerY).toBe(400 - 40);
  });

  it("positions footer at bottom edge when no footer", () => {
    const layout = calculateLayout({
      hasLogo: false,
      hasTagline: false,
      hasFeatures: false,
      hasFooter: false,
    });

    expect(layout.footerY).toBe(DEFAULT_HEIGHT);
  });
});
