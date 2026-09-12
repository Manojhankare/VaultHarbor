# Autofill

## Flow

1. Content script detects login fields: a visible password field, or (multi-step step one) an explicit username/email field — not UI filters (`type=search`, `role=combobox` / `searchbox`, branch/tag pickers, or name/id/placeholder/label hints like “search”, “find”, “filter”, “branch”). When several login forms exist (e.g. registration on the page + a sign-in modal), the **topmost / focused / sign-in** context wins — not the first form in DOM order.
2. Service worker returns matching credentials for **sender tab URL** (not content-script claims).
3. Focusing or clicking the **username or password** field opens a credential picker. The picker is a **`chrome-extension://` iframe** (same pattern as Bitwarden / NordPass). It is parented in the **sign-in dialog when present**, otherwise a non-clipping form — not an `overflow:hidden` inner wrapper (that used to crop or offset the menu). Clicks inside the iframe never reach the host page, so Workday-style Sign In modals stay open. Overlay coordinates account for `transform` / `filter` / `will-change` containing blocks (but ignore `will-change` on `body`/`html`). Fill then uses click/focus/keyboard simulation plus a native value setter and `composed: true` `input`/`change` events. Multi-step logins (email first, password on next screen) fill the email immediately and auto-fill the password when that field appears.
4. Detection walks open/closed shadow roots (`chrome.dom.openOrClosedShadowRoot`) so custom-element fields (Workday) are found. Overlay attachment also walks shadow hosts to find the page form/dialog. Autofill remembers the focused field if a full-page scan misses the modal. The fill icon uses `isConnected` (not `document.contains`) so shadow-tree fields are not treated as detached.

## Domain matching

Implemented in `src/domain/matching.ts`:

- Parse with `URL` API, compare hostnames
- Exact match or true subdomain (`pageHost.endsWith('.' + savedHost)`)
- Reject bare public suffixes (`com`, `co.uk`, …)
- `https` saved credentials never fill into `http` pages
- No substring / `includes()` matching

## Phishing resistance

Background worker validates origin before releasing passwords. Content scripts receive passwords only for `FILL_FIELDS` after user gesture.

## UI surfaces

| UI | Implementation |
|----|----------------|
| In-field icon | Closed shadow root, vertically centered in the **visible** field wrapper, immediately left of show-password / trailing controls. Viewport coordinates are converted when a parent `transform`/`filter`/`will-change` creates a containing block. |
| Credential dropdown | Compact suggestion menu (`picker.html` iframe) under the field, parented in the login dialog/form. Username-first rows with favicon (page icon, then Google; Google’s 16px globe falls back to the VaultHarbor lock). Custom vault names only (not `instagram.com`). Chevron on the highlighted row. No Fill button (click / Enter fills). Width and the bottom edge follow the **visible** field wrapper (pill / underline), not a shorter inner `<input>` — so the menu is as wide as the field and sits flush under it. Min 260px only when the field itself is thinner; a field-width menu is not shifted to satisfy a tight visual viewport. Light or dark to match the page. ↑/↓ then Enter; Escape or outside click closes. Footer: VaultHarbor mark, **Manage vault** (opens `vault.html`), close. |
| Save prompt | `save-prompt.html` iframe — shown on the **post-login page** after redirect (pending save stored in session; background re-injects via `tabs.onUpdated` and `webNavigation.onHistoryStateUpdated` for SPAs like LinkedIn) |

## Save prompt capture

Login capture listens for traditional form submit **and** SPA patterns:

- Clicks on **Sign in / Log in / Continue** buttons (including `type="button"`)
- Enter in the password field
- Password field removed from the DOM after fill (post-login UI swap)
- `history.pushState` / `replaceState` (client-side navigation after login)

If the vault is **locked** when the save iframe opens, the UI shows **Unlock to save** first (master password + optional **Keep unlocked this session**). After unlock it advances to the editable save form. **Keep unlocked** skips auto-lock for the rest of the browser session (cleared on manual Lock / Logout / browser restart). Configure the idle timeout under **Security → Auto-lock** in the full vault app.

### Save vs update (NordPass-style)

After login capture:

| Situation | Prompt |
|-----------|--------|
| Same site + same username + **same password** | No prompt |
| Same site + same username + **new password** | **Update password?** — updates the existing vault entry |
| Same site + **new username** | **Save login?** — adds a new entry |
| New site | **Save login?** |

## Cross-origin iframes

Content scripts run in all frames (`all_frames: true`). Matching uses the **frame's** tab URL from the service worker.
