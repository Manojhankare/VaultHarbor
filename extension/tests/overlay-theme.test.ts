import { afterEach, describe, expect, it } from "vitest";
import {
  detectOverlayTheme,
  parseCssRgb,
  relativeLuminance,
} from "../src/content/overlay-theme";

describe("parseCssRgb", () => {
  it("parses comma rgb/rgba", () => {
    expect(parseCssRgb("rgb(255, 255, 255)")).toEqual({
      r: 255,
      g: 255,
      b: 255,
      a: 1,
    });
    expect(parseCssRgb("rgba(0, 0, 0, 0)")).toEqual({ r: 0, g: 0, b: 0, a: 0 });
  });

  it("parses space-separated rgb", () => {
    expect(parseCssRgb("rgb(18 18 18 / 0.95)")).toEqual({
      r: 18,
      g: 18,
      b: 18,
      a: 0.95,
    });
  });

  it("treats transparent as zero alpha", () => {
    expect(parseCssRgb("transparent")?.a).toBe(0);
  });
});

describe("relativeLuminance", () => {
  it("is 1 for white and 0 for black", () => {
    expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 5);
    expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 5);
  });
});

describe("detectOverlayTheme", () => {
  afterEach(() => {
    document.documentElement.style.backgroundColor = "";
    document.body.style.backgroundColor = "";
    document.body.innerHTML = "";
  });

  it("uses a white field as light", () => {
    document.body.style.backgroundColor = "rgb(255, 255, 255)";
    const input = document.createElement("input");
    input.style.backgroundColor = "rgb(255, 255, 255)";
    input.style.color = "rgb(15, 23, 42)";
    document.body.appendChild(input);
    expect(detectOverlayTheme(input)).toBe("light");
  });

  it("uses a dark field as dark", () => {
    document.body.style.backgroundColor = "rgb(18, 18, 18)";
    const input = document.createElement("input");
    input.style.backgroundColor = "rgb(18, 18, 18)";
    input.style.color = "rgb(250, 250, 250)";
    document.body.appendChild(input);
    expect(detectOverlayTheme(input)).toBe("dark");
  });

  it("walks past a transparent input to a dark modal", () => {
    document.body.style.backgroundColor = "rgb(255, 255, 255)";
    const modal = document.createElement("div");
    modal.style.backgroundColor = "rgb(10, 18, 32)";
    const input = document.createElement("input");
    input.style.backgroundColor = "rgba(0, 0, 0, 0)";
    modal.appendChild(input);
    document.body.appendChild(modal);
    expect(detectOverlayTheme(input)).toBe("dark");
  });
});
