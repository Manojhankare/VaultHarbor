/** Page-aware theme for the credential picker so it is not a dark blob on light logins. */

export type OverlayTheme = "light" | "dark";

const OPAQUE_ALPHA = 0.6;
const DARK_LUMINANCE = 0.4;

export function parseCssRgb(
  color: string
): { r: number; g: number; b: number; a: number } | null {
  const s = color.trim().toLowerCase();
  if (!s || s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };

  const comma = s.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/
  );
  if (comma) {
    return {
      r: Number(comma[1]),
      g: Number(comma[2]),
      b: Number(comma[3]),
      a: comma[4] === undefined ? 1 : Number(comma[4]),
    };
  }

  const space = s.match(
    /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/
  );
  if (space) {
    const rawA = space[4];
    let a = 1;
    if (rawA !== undefined) {
      a = rawA.endsWith("%") ? Number(rawA.slice(0, -1)) / 100 : Number(rawA);
    }
    return { r: Number(space[1]), g: Number(space[2]), b: Number(space[3]), a };
  }

  return null;
}

function srgbChannel(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

function themeFromRgb(r: number, g: number, b: number): OverlayTheme {
  return relativeLuminance(r, g, b) < DARK_LUMINANCE ? "dark" : "light";
}

function preferColorScheme(): OverlayTheme {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

/**
 * Walk the field and ancestors for an opaque background. Fall back to text
 * color (light text → dark menu) then OS color-scheme.
 */
export function detectOverlayTheme(anchor: Element): OverlayTheme {
  let node: Element | null = anchor;
  while (node && node !== document.documentElement) {
    const bg = parseCssRgb(getComputedStyle(node).backgroundColor);
    if (bg && bg.a >= OPAQUE_ALPHA) {
      return themeFromRgb(bg.r, bg.g, bg.b);
    }
    node = node.parentElement;
  }

  const htmlBg = parseCssRgb(getComputedStyle(document.documentElement).backgroundColor);
  if (htmlBg && htmlBg.a >= OPAQUE_ALPHA) {
    return themeFromRgb(htmlBg.r, htmlBg.g, htmlBg.b);
  }

  const text = parseCssRgb(getComputedStyle(anchor).color);
  if (text && text.a >= OPAQUE_ALPHA) {
    return relativeLuminance(text.r, text.g, text.b) > 0.55 ? "dark" : "light";
  }

  return preferColorScheme();
}
