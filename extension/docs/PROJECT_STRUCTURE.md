# Extension Project Structure

```text
extension/
├── src/
│   ├── background/
│   │   ├── service-worker.ts   MV3 entry, alarms, listeners
│   │   ├── messages.ts         Typed message router
│   │   ├── clipboard.ts        Offscreen copy/clear
│   │   ├── session-key.ts      DEK session persistence
│   │   ├── pending-save.ts     Save-login staging
│   │   └── state.ts            Runtime cache flags
│   ├── content/
│   │   ├── content-script.ts   Page injection entry
│   │   ├── detector.ts         Login form detection
│   │   ├── autofill.ts         Field filling
│   │   └── save-login.ts       Icon + iframe UI
│   ├── popup/
│   │   ├── App.tsx             Route by auth/vault state
│   │   ├── pages/              Login, unlock, vault, CRUD
│   │   └── components/         Password generator, BrandHeader, AuthorFooter
│   ├── vault/
│   │   ├── crypto.ts           PBKDF2, AES-GCM
│   │   ├── codec.ts            Vault JSON + tombstones
│   │   ├── storage.ts          IndexedDB
│   │   └── vault.ts            Lock/unlock, CRUD
│   ├── sync/
│   │   ├── sync.ts             Upload/download/poll
│   │   └── conflict.ts         Merge export
│   ├── auth/                   Tokens + login flow
│   ├── api/                    REST client modules
│   ├── domain/                 URL + hostname matching
│   ├── devices/                Device registration
│   ├── password-generator/
│   ├── offscreen/              Clipboard document
│   ├── shared/                 browser shim, constants, brand, author
│   └── types/                  API DTOs
├── tests/
├── public/icons/
├── dist/chrome/                Chromium build
├── dist/firefox/               Firefox build (unverified)
├── manifest.chrome.json
├── manifest.firefox.json
└── BACKEND_INTEGRATION_NOTES.md
```
