# Autofill

## Flow

1. Content script detects login fields: a visible password field, or (multi-step step one) an explicit username/email field — not UI filters (`type=search`, `role=combobox` / `searchbox`, branch/tag pickers, or name/id/placeholder/label hints like “search”, “find”, “filter”, “branch”). When several login forms exist (e.g. registration on the page + a sign-in modal), the **topmost / focused / sign-in** context wins — not the first form in DOM order.
2. Service worker returns matching credentials for **sender tab URL** (not content-script claims).
3. Focusing or clicking the **username or password** field opens a credential picker. The picker is a **`chrome-extension://` iframe** (same pattern as Bitwarden / NordPass), parented **inside the login dialog or form** — not `document.body`. Clicks inside that iframe never reach the host page, so Workday-style Sign In modals stay open. Fill then uses click/focus/keyboard simulation plus a native value setter and `composed: true` `input`/`change` events. Multi-step logins (email first, password on next screen) fill the email immediately and auto-fill the password when that field appears.
4. Detection walks open/closed shadow roots (`chrome.dom.openOrClosedShadowRoot`) so custom-element fields (Workday) are found. Autofill remembers the focused field if a full-page scan misses the modal.

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
| In-field icon | Closed shadow root; fixed position **outside** the password field (right side, or left if no room) so it doesn’t cover show-password controls |
| Credential dropdown | `chrome-extension://` iframe (`picker.html`) anchored under the field and parented in the login dialog/form |
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
