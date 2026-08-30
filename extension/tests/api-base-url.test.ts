import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_API_BASE_URL, STORAGE_KEYS } from "../src/shared/constants";
import { ExtensionError } from "../src/shared/errors";
import {
  isUnencryptedHttpUrl,
  normalizeApiBaseUrl,
} from "../src/shared/api-url-validation";
import { readApiBaseOriginFromStorage, readApiBaseUrlFromStorage } from "../src/shared/api-base-url-read";
import {
  getApiBaseUrl,
  getApiBaseUrlInfo,
  resetApiBaseUrlCache,
  switchApiBaseUrl,
} from "../src/config/api-base-url";
import { storageLocalGet } from "../src/shared/browser";
import { resetChromeStorage } from "./setup";

vi.mock("../src/auth/auth", () => ({
  isAuthenticated: vi.fn(async () => false),
  logoutAccount: vi.fn(async () => {}),
}));

vi.mock("../src/vault/vault", () => ({
  lockVault: vi.fn(async () => {}),
}));

vi.mock("../src/vault/storage", () => ({
  wipeLocalVaultState: vi.fn(async () => {}),
}));

describe("normalizeApiBaseUrl", () => {
  it("strips trailing slash and returns origin", () => {
    expect(normalizeApiBaseUrl("https://vault.example.com/")).toBe(
      "https://vault.example.com"
    );
  });

  it("prepends https when scheme is omitted", () => {
    expect(normalizeApiBaseUrl("vault.example.com")).toBe(
      "https://vault.example.com"
    );
  });

  it("strips path to origin only", () => {
    expect(normalizeApiBaseUrl("https://vault.example.com/api/v1")).toBe(
      "https://vault.example.com"
    );
  });

  it("preserves port", () => {
    expect(normalizeApiBaseUrl("http://localhost:5000/")).toBe(
      "http://localhost:5000"
    );
  });

  it("rejects empty input", () => {
    expect(() => normalizeApiBaseUrl("   ")).toThrow(ExtensionError);
  });

  it("rejects unsupported protocols", () => {
    expect(() => normalizeApiBaseUrl("ftp://vault.example.com")).toThrow(
      ExtensionError
    );
  });
});

describe("isUnencryptedHttpUrl", () => {
  it("allows localhost http without warning", () => {
    expect(isUnencryptedHttpUrl("http://localhost:5000")).toBe(false);
  });

  it("flags remote http", () => {
    expect(isUnencryptedHttpUrl("http://vault.example.com")).toBe(true);
  });

  it("returns false for empty or invalid urls", () => {
    expect(isUnencryptedHttpUrl("")).toBe(false);
    expect(isUnencryptedHttpUrl("not-a-url")).toBe(false);
  });
});

describe("getApiBaseUrl", () => {
  beforeEach(() => {
    resetChromeStorage();
    resetApiBaseUrlCache();
  });

  it("falls back to build default when storage is empty", async () => {
    await expect(getApiBaseUrl()).resolves.toBe(DEFAULT_API_BASE_URL);
  });

  it("reads override from storage", async () => {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set(
        { [STORAGE_KEYS.API_BASE_URL]: "https://self-hosted.example.com" },
        () => resolve()
      );
    });
    await expect(getApiBaseUrl()).resolves.toBe("https://self-hosted.example.com");
  });
});

describe("switchApiBaseUrl", () => {
  beforeEach(() => {
    resetChromeStorage();
    resetApiBaseUrlCache();
  });

  it("no-ops when URL is unchanged", async () => {
    const before = await getApiBaseUrlInfo();
    const result = await switchApiBaseUrl(before.url);
    expect(result.url).toBe(before.url);
    const stored = await storageLocalGet([STORAGE_KEYS.API_BASE_URL]);
    expect(stored[STORAGE_KEYS.API_BASE_URL]).toBeUndefined();
  });

  it("persists custom URL after switch", async () => {
    const result = await switchApiBaseUrl("https://custom.example.com");
    expect(result.url).toBe("https://custom.example.com");
    expect(result.isDefault).toBe(false);
    const stored = await storageLocalGet([STORAGE_KEYS.API_BASE_URL]);
    expect(stored[STORAGE_KEYS.API_BASE_URL]).toBe("https://custom.example.com");
  });

  it("removes override when switching back to default", async () => {
    await switchApiBaseUrl("https://custom.example.com");
    resetApiBaseUrlCache();
    const result = await switchApiBaseUrl(DEFAULT_API_BASE_URL);
    expect(result.url).toBe(DEFAULT_API_BASE_URL);
    expect(result.isDefault).toBe(true);
    const stored = await storageLocalGet([STORAGE_KEYS.API_BASE_URL]);
    expect(stored[STORAGE_KEYS.API_BASE_URL]).toBeUndefined();
  });

  it("runs concurrent switches sequentially", async () => {
    const first = switchApiBaseUrl("https://first.example.com");
    const second = switchApiBaseUrl("https://second.example.com");
    const [a, b] = await Promise.all([first, second]);
    expect(a.url).toBe("https://first.example.com");
    expect(b.url).toBe("https://second.example.com");
    await expect(getApiBaseUrl()).resolves.toBe("https://second.example.com");
  });
});

describe("readApiBaseUrlFromStorage", () => {
  beforeEach(() => {
    resetChromeStorage();
    resetApiBaseUrlCache();
  });

  it("reads override without using resolver cache", async () => {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set(
        { [STORAGE_KEYS.API_BASE_URL]: "https://cached-miss.example.com" },
        () => resolve()
      );
    });
    await getApiBaseUrl(); // prime resolver cache
    await expect(readApiBaseUrlFromStorage()).resolves.toBe(
      "https://cached-miss.example.com"
    );
    await expect(readApiBaseOriginFromStorage()).resolves.toBe(
      "https://cached-miss.example.com"
    );
  });
});
