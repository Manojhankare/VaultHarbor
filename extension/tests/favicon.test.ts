import { describe, expect, it } from "vitest";
import {
  detectPageFaviconUrl,
  faviconChain,
  isGenericGoogleFavicon,
} from "../src/shared/favicon";

describe("isGenericGoogleFavicon", () => {
  it("treats Google’s 16px globe as missing", () => {
    expect(
      isGenericGoogleFavicon({
        src: "https://www.google.com/s2/favicons?domain=example.com&sz=32",
        naturalWidth: 16,
      })
    ).toBe(true);
  });

  it("keeps a real scaled favicon", () => {
    expect(
      isGenericGoogleFavicon({
        src: "https://www.google.com/s2/favicons?domain=instagram.com&sz=32",
        naturalWidth: 32,
      })
    ).toBe(false);
  });

  it("does not flag the VaultHarbor lock", () => {
    expect(
      isGenericGoogleFavicon({
        src: "chrome-extension://id/icons/icon128.png",
        naturalWidth: 16,
      })
    ).toBe(false);
  });
});

describe("detectPageFaviconUrl", () => {
  it("picks the largest http icon on the page", () => {
    document.head.innerHTML = `
      <link rel="icon" href="/favicon-16.png" sizes="16x16" />
      <link rel="icon" href="https://cdn.example.com/icon-32.png" sizes="32x32" />
    `;
    expect(detectPageFaviconUrl(document)).toBe("https://cdn.example.com/icon-32.png");
    document.head.innerHTML = "";
  });

  it("skips data URLs", () => {
    document.head.innerHTML = `<link rel="icon" href="data:image/png;base64,aaaa" />`;
    expect(detectPageFaviconUrl(document)).toBeNull();
    document.head.innerHTML = "";
  });
});

describe("faviconChain", () => {
  it("ends with the VaultHarbor lock", () => {
    const chain = faviconChain("https://hostinger.com", null);
    expect(chain[0]).toContain("google.com/s2/favicons");
    expect(chain.at(-1)).toContain("icons/icon128.png");
  });
});
