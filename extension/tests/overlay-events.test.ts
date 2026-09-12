import { afterEach, describe, expect, it } from "vitest";
import { shieldOverlayHost } from "../src/content/overlay-events";

describe("shieldOverlayHost", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("keeps document capture listeners from seeing overlay pointer events", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);

    const seen: string[] = [];
    document.addEventListener(
      "mousedown",
      () => {
        seen.push("document");
      },
      true
    );

    let overlaySaw = false;
    const unshield = shieldOverlayHost(host, () => {
      overlaySaw = true;
    });

    host.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true })
    );

    expect(overlaySaw).toBe(true);
    expect(seen).toEqual([]);
    unshield();
  });

  it("does not intercept clicks outside the overlay", () => {
    const host = document.createElement("div");
    const other = document.createElement("button");
    document.body.append(host, other);

    let pageSaw = false;
    document.addEventListener(
      "mousedown",
      () => {
        pageSaw = true;
      },
      true
    );

    const unshield = shieldOverlayHost(host, () => undefined);
    other.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true })
    );

    expect(pageSaw).toBe(true);
    unshield();
  });
});
