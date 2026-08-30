# Extension Architecture

## Overview

MV3 extension with a **service worker** as the single source of truth. Popup and content scripts are untrusted views.

```text
Page → Content script → Service worker → API / IndexedDB / storage.session
Popup ─────────────────→ Service worker
```

## Components

| Layer | Role |
|-------|------|
| `src/background/` | Auth, vault lock, sync, message routing |
| `src/popup/` | Compact toolbar popup (quick fill, Open Vault) |
| `src/vault-app/` | Full-screen vault manager (`vault.html`) |
| `src/ui/` | Shared AuthRoot + vault layout components |
| `src/content/` | Form detection, autofill icon, save prompt iframes |
| `src/vault/` | Crypto, codec, IndexedDB |
| `src/api/` | Typed REST client |
| `src/sync/` | Revision-based upload/download |
| `src/domain/` | URL normalization and hostname matching |

## Target browsers

| Browser | Build | Status |
|---------|-------|--------|
| Chrome | `dist/chrome` | V1 target |
| Edge | `dist/chrome` | V1 target |
| Brave | `dist/chrome` | V1 target |
| Firefox | `dist/firefox` | Build only, not verified |

Chromium-only APIs (e.g. `chrome.offscreen`) live in `src/shared/capabilities.ts`.

## Service worker lifecycle

Module-scope state is **cache only**. Every handler rehydrates from `storage.session` and IndexedDB. See `tests/worker-restart.test.ts`.

## Storage

| Store | Contents |
|-------|----------|
| `chrome.storage.local` | JWT refresh token, device id, KDF metadata |
| `chrome.storage.session` | Raw DEK bytes while unlocked (memory-only) |
| IndexedDB | Encrypted vault blob, pending changes, conflict snapshots |

Plaintext passwords never touch `localStorage` or disk.
