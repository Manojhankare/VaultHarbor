/**
 * Overlays are parented in the login form/dialog (Workday focus-trap).
 * `position:fixed` is viewport-relative unless an ancestor is a containing
 * block (transform, filter, will-change, …). Convert viewport coords so the
 * icon and picker stay glued to the field on every site.
 */

export function createsFixedContainingBlock(el: Element): boolean {
  if (el instanceof HTMLElement) {
    const inline = el.style;
    if (nonNone(inline.transform) || nonNone(inline.perspective) || nonNone(inline.filter)) {
      return true;
    }
    if (inline.willChange && /transform|perspective|filter|contain/i.test(inline.willChange)) {
      return true;
    }
  }
  return styleCreatesFixedContainingBlock(getComputedStyle(el));
}

export function styleCreatesFixedContainingBlock(s: CSSStyleDeclaration): boolean {
  if (nonNone(s.transform) || nonNone(s.perspective) || nonNone(s.filter)) return true;
  const backdrop =
    s.getPropertyValue("backdrop-filter") ||
    (s as CSSStyleDeclaration & { backdropFilter?: string }).backdropFilter ||
    "";
  if (nonNone(backdrop)) return true;
  if (s.contain && /paint|layout|strict|content/.test(s.contain)) return true;
  if (s.willChange && /transform|perspective|filter|contain/i.test(s.willChange)) return true;
  if (nonNone(s.getPropertyValue("translate"))) return true;
  if (nonNone(s.getPropertyValue("rotate"))) return true;
  if (nonNone(s.getPropertyValue("scale"))) return true;
  return false;
}

function nonNone(value: string | undefined): boolean {
  return Boolean(value && value !== "none" && value !== "");
}

function isDocumentRoot(el: Element): boolean {
  return el === document.documentElement || el === document.body;
}

function documentRootHasFixedTransform(el: Element): boolean {
  const s = getComputedStyle(el);
  if (nonNone(s.transform) || nonNone(s.filter) || nonNone(s.perspective)) return true;
  if (el instanceof HTMLElement) {
    const inline = el.style;
    if (nonNone(inline.transform) || nonNone(inline.filter) || nonNone(inline.perspective)) {
      return true;
    }
  }
  return false;
}

function composedOffsetParent(el: HTMLElement): HTMLElement | null {
  if (el.parentElement) return el.parentElement;
  const root = el.getRootNode();
  if (root instanceof ShadowRoot && root.host instanceof HTMLElement) {
    return root.host;
  }
  return null;
}

/** Viewport origin of the box `position:fixed` is actually relative to. */
export function overlayFixedOrigin(host: HTMLElement): { x: number; y: number } {
  let node = composedOffsetParent(host);
  while (node) {
    const treatAsCb = isDocumentRoot(node)
      ? documentRootHasFixedTransform(node)
      : createsFixedContainingBlock(node);
    if (treatAsCb) {
      const r = node.getBoundingClientRect();
      const s = getComputedStyle(node);
      return {
        x: r.left + (Number.parseFloat(s.borderLeftWidth) || 0),
        y: r.top + (Number.parseFloat(s.borderTopWidth) || 0),
      };
    }
    if (node === document.documentElement) break;
    node = composedOffsetParent(node);
  }
  return { x: 0, y: 0 };
}

export function applyOverlayFixed(
  host: HTMLElement,
  viewportLeft: number,
  viewportTop: number,
  size?: { width?: number; height?: number }
): void {
  const origin = overlayFixedOrigin(host);
  host.style.position = "fixed";
  host.style.left = `${viewportLeft - origin.x}px`;
  host.style.top = `${viewportTop - origin.y}px`;
  if (size?.width != null) host.style.width = `${size.width}px`;
  if (size?.height != null) host.style.height = `${size.height}px`;
}

export type LayoutViewport = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Visible layout viewport (visualViewport when zoomed / mobile keyboard). */
export function layoutViewport(): LayoutViewport {
  const vv = window.visualViewport;
  if (vv && vv.width > 0 && vv.height > 0) {
    return {
      left: vv.offsetLeft,
      top: vv.offsetTop,
      width: vv.width,
      height: vv.height,
    };
  }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

export type FieldBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

function fieldBoxFromRect(r: DOMRect): FieldBox {
  return {
    left: r.left,
    right: r.right,
    top: r.top,
    bottom: r.bottom,
    width: r.width,
    height: r.height,
  };
}

/** Align a menu to the field; hang off the right edge only if the menu is wider than the field. */
export function alignDropdownToField(
  field: FieldBox,
  picker: { width: number; height: number },
  viewport: { width: number; height: number; left?: number; top?: number },
  gap = 4
): { left: number; top: number } {
  const gutter = 8;
  const viewLeft = viewport.left ?? 0;
  const viewTop = viewport.top ?? 0;
  const viewRight = viewLeft + viewport.width;
  const viewBottom = viewTop + viewport.height;

  let left = field.left;
  const widerThanField = picker.width > field.width + 0.5;
  if (widerThanField) {
    if (left + picker.width > viewRight - gutter) {
      left = field.right - picker.width;
    }
    if (left < viewLeft + gutter) left = viewLeft + gutter;
    if (left + picker.width > viewRight - gutter) {
      left = Math.max(viewLeft + gutter, viewRight - picker.width - gutter);
    }
  }

  let top = field.bottom + gap;
  if (
    top + picker.height > viewBottom - gutter &&
    field.top - viewTop > picker.height + gap
  ) {
    top = field.top - picker.height - gap;
  }
  return { left, top };
}

const OVERLAY_IDS = new Set(["vaultharbor-fill-icon", "vaultharbor-cred-dropdown"]);

function copyRect(r: DOMRect): DOMRect {
  return new DOMRect(r.x, r.y, r.width, r.height);
}

function isOverlayNode(el: Element): boolean {
  let n: Element | null = el;
  while (n) {
    if (OVERLAY_IDS.has(n.id)) return true;
    n = n.parentElement;
  }
  return false;
}

/** Padding of a pill / underline control — not a stacked label+input group. */
const PILL_VERTICAL_SLACK = 16;
/** Eye button + VaultHarbor pill + field padding (OpenAI / Hostinger). */
const PILL_HORIZONTAL_SLACK = 200;

/**
 * Visible rounded field: the input, or a same-row wrapper that also holds
 * the show-password control (OpenAI / Hostinger). Width and height come from
 * that same box so the picker is as wide as the field and sits flush under it.
 */
export function visualFieldBox(anchor: HTMLElement): DOMRect {
  const input = copyRect(anchor.getBoundingClientRect());
  let best = input;
  let node = composedOffsetParent(anchor);
  for (let i = 0; i < 8 && node && !isDocumentRoot(node); i++) {
    if (isOverlayNode(node)) {
      node = composedOffsetParent(node);
      continue;
    }
    const r = node.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) {
      node = composedOffsetParent(node);
      continue;
    }
    if (r.height > input.height + PILL_VERTICAL_SLACK) break;
    if (r.width > input.width + PILL_HORIZONTAL_SLACK) break;
    if (
      r.width + 1 >= input.width &&
      r.left <= input.left + 16 &&
      r.right + 1 >= input.right
    ) {
      best = copyRect(r);
    }
    node = composedOffsetParent(node);
  }
  return best;
}

/** Menu uses the visible field for both width and the top/bottom edge. */
export function dropdownAnchorBox(anchor: HTMLElement): FieldBox {
  return fieldBoxFromRect(visualFieldBox(anchor));
}

export function trailingControlRects(anchor: HTMLElement, field: DOMRect): DOMRect[] {
  const hits: DOMRect[] = [];
  const seen = new Set<Element>();

  const consider = (el: Element) => {
    if (seen.has(el) || el === anchor || isOverlayNode(el)) return;
    seen.add(el);
    if (!(el instanceof HTMLElement)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    if (r.width > 72 || r.height > field.height + 16) return;
    const overlap = Math.min(r.bottom, field.bottom) - Math.max(r.top, field.top);
    if (overlap < 10) return;
    if (r.left < field.left + field.width * 0.45) return;
    if (r.right > field.right + 16) return;
    hits.push(copyRect(r));
  };

  let sib: Element | null = anchor.nextElementSibling;
  while (sib) {
    consider(sib);
    sib.querySelectorAll("button, [role='button']").forEach(consider);
    sib = sib.nextElementSibling;
  }

  let parent = anchor.parentElement;
  for (let i = 0; i < 3 && parent; i++) {
    parent.querySelectorAll("button, [role='button']").forEach(consider);
    parent = parent.parentElement;
  }
  return hits;
}

/** Sit the pill just left of the eye / trailing controls, inside the visible field. */
export function fillIconViewportBox(
  anchor: HTMLInputElement,
  pill: { width: number; height: number }
): { left: number; top: number } {
  const field = visualFieldBox(anchor);
  const trailing = trailingControlRects(anchor, field);
  const gap = 6;
  let rightEdge = field.right - gap;
  if (trailing.length > 0) {
    rightEdge = Math.min(rightEdge, ...trailing.map((r) => r.left - gap));
  } else if (anchor.type === "password") {
    const pad = Number.parseFloat(getComputedStyle(anchor).paddingRight) || 0;
    const reserve = pad > 8 ? Math.min(pad, 48) : 36;
    rightEdge = field.right - reserve;
  }
  let left = rightEdge - pill.width;
  if (left < field.left + gap) left = field.left + gap;
  const input = anchor.getBoundingClientRect();
  const top = input.top + (input.height - pill.height) / 2;
  return { left, top };
}
