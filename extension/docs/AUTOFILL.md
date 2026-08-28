# Autofill

## Flow

1. Content script detects login forms (`input[type=password]`).
2. Service worker returns matching credentials for **sender tab URL** (not content-script claims).
3. User clicks in-field icon → picker (if multiple) → fill on explicit action.

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
| In-field icon | Closed shadow root, inline in content script bundle |
| Credential picker | `picker.html` iframe, `web_accessible_resources` + `use_dynamic_url` |
| Save prompt | `save-prompt.html` iframe |

## Cross-origin iframes

Content scripts run in all frames (`all_frames: true`). Matching uses the **frame's** tab URL from the service worker.
