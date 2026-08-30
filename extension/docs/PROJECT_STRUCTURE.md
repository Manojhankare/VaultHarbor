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
│   │   ├── App.tsx             AuthRoot wrapper + compact vault
│   │   ├── pages/              Login, unlock, vault, CRUD
│   │   └── components/         Password generator, BrandHeader, AuthorFooter
│   ├── vault-app/
│   │   ├── main.tsx            Full-screen vault.html entry
│   │   ├── App.tsx             AuthRoot + VaultManagerApp
│   │   └── vault-app.css       Full-viewport layout
│   ├── ui/
│   │   ├── AuthRoot.tsx        Shared login/unlock/setup routing
│   │   └── vault/              Full-screen vault manager UI
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
│   ├── config/
│   │   └── api-base-url.ts     Runtime backend URL resolver + server switch
│   ├── domain/                 URL matching + vault item summaries
│   ├── devices/                Device registration
│   ├── password-generator/
│   ├── offscreen/              Clipboard document
│   ├── shared/                 browser shim, constants, brand, open-vault-tab, api-url-validation
│   └── types/                  API DTOs
├── popup.html
├── vault.html                  Full-screen vault manager
├── picker.html
├── tests/
├── public/icons/
├── dist/chrome/                Chromium build
├── dist/firefox/               Firefox build (unverified)
├── manifest.chrome.json
├── manifest.firefox.json
└── BACKEND_INTEGRATION_NOTES.md
```
