import { afterEach, describe, expect, it } from "vitest";
import {
  alignDropdownToField,
  applyOverlayFixed,
  createsFixedContainingBlock,
  dropdownAnchorBox,
  fillIconViewportBox,
  visualFieldBox,
} from "../src/content/overlay-position";

function setRect(
  el: HTMLElement,
  left: number,
  top: number,
  width: number,
  height: number
): void {
  el.getBoundingClientRect = () => new DOMRect(left, top, width, height);
}

describe("alignDropdownToField", () => {
  const viewport = { width: 1280, height: 800 };

  it("lines up with the field’s left edge", () => {
    expect(
      alignDropdownToField(
        { left: 400, right: 720, top: 200, bottom: 244, width: 320, height: 44 },
        { width: 320, height: 120 },
        viewport
      )
    ).toEqual({ left: 400, top: 248 });
  });

  it("keeps the right edge on the field when a min-width menu would overflow", () => {
    expect(
      alignDropdownToField(
        { left: 1100, right: 1260, top: 200, bottom: 244, width: 160, height: 44 },
        { width: 260, height: 120 },
        viewport
      ).left
    ).toBe(1000);
  });

  it("does not pull a field-width menu off the field to satisfy a tight viewport", () => {
    expect(
      alignDropdownToField(
        { left: 40, right: 380, top: 200, bottom: 248, width: 340, height: 48 },
        { width: 340, height: 180 },
        { left: 0, top: 0, width: 360, height: 800 }
      ).left
    ).toBe(40);
  });
});

describe("createsFixedContainingBlock", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("detects transform / will-change on the node", () => {
    const el = document.createElement("div");
    document.body.appendChild(el);
    expect(createsFixedContainingBlock(el)).toBe(false);
    el.style.transform = "translateZ(0)";
    expect(createsFixedContainingBlock(el)).toBe(true);
    el.style.transform = "";
    el.style.willChange = "transform";
    expect(createsFixedContainingBlock(el)).toBe(true);
  });
});

describe("applyOverlayFixed", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    document.body.style.willChange = "";
  });

  it("subtracts a transformed ancestor so viewport coords stay on the field", () => {
    const ancestor = document.createElement("div");
    ancestor.style.transform = "translateZ(0)";
    ancestor.getBoundingClientRect = () => new DOMRect(80, 40, 400, 500);
    const host = document.createElement("div");
    ancestor.appendChild(host);
    document.body.appendChild(ancestor);

    applyOverlayFixed(host, 120, 90, { width: 52, height: 32 });

    expect(host.style.position).toBe("fixed");
    expect(host.style.left).toBe("40px");
    expect(host.style.top).toBe("50px");
  });

  it("ignores will-change on body so default body margin does not shift overlays", () => {
    document.body.style.willChange = "transform";
    const host = document.createElement("div");
    document.body.appendChild(host);
    document.body.getBoundingClientRect = () => new DOMRect(8, 8, 800, 600);

    applyOverlayFixed(host, 120, 90);

    expect(host.style.left).toBe("120px");
    expect(host.style.top).toBe("90px");
  });
});

describe("visualFieldBox + fillIconViewportBox", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("uses the rounded wrapper and sits just left of a sibling eye button", () => {
    const wrap = document.createElement("div");
    const input = document.createElement("input");
    input.type = "password";
    const eye = document.createElement("button");
    eye.type = "button";
    wrap.append(input, eye);
    document.body.appendChild(wrap);

    setRect(wrap, 100, 200, 400, 48);
    setRect(input, 100, 200, 320, 48);
    setRect(eye, 452, 208, 32, 32);

    const field = visualFieldBox(input);
    expect(field.width).toBe(400);
    expect(field.right).toBe(500);

    const pos = fillIconViewportBox(input, { width: 52, height: 32 });
    expect(pos.left).toBe(452 - 6 - 52);
    expect(pos.top).toBe(200 + (48 - 32) / 2);
  });

  it("uses a pill wrapper even when the inner input is much narrower (OpenAI)", () => {
    const wrap = document.createElement("div");
    const input = document.createElement("input");
    input.type = "password";
    const eye = document.createElement("button");
    eye.type = "button";
    wrap.append(input, eye);
    document.body.appendChild(wrap);

    setRect(wrap, 100, 200, 420, 52);
    setRect(input, 116, 204, 260, 44);
    setRect(eye, 472, 210, 32, 32);

    const field = visualFieldBox(input);
    expect(field.width).toBe(420);
    expect(field.left).toBe(100);
    expect(field.bottom).toBe(252);

    const anchor = dropdownAnchorBox(input);
    expect(anchor.width).toBe(420);
    expect(anchor.bottom).toBe(252);
    expect(anchor.top).toBe(200);
  });

  it("does not treat a labeled form group as the field (avoids a gap under the input)", () => {
    const group = document.createElement("div");
    const input = document.createElement("input");
    input.type = "password";
    group.appendChild(input);
    document.body.appendChild(group);

    setRect(group, 100, 200, 400, 80);
    setRect(input, 100, 200, 400, 48);

    const field = visualFieldBox(input);
    expect(field.height).toBe(48);
    expect(field.bottom).toBe(248);

    const anchor = dropdownAnchorBox(input);
    expect(anchor.bottom).toBe(248);
    expect(anchor.width).toBe(400);
    expect(anchor.height).toBe(48);
  });
});
