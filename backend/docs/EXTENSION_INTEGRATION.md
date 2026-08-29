# Extension Integration Guide

This guide maps the nine-step extension flow to concrete API calls.

**VaultSync** — made by [Manoj Hankare](https://manojhankare.in)

## Prerequisites

- MV3 service worker with `host_permissions` for your API domain
- Tokens stored in `chrome.storage.local` (never `chrome.storage.sync`)
- All API calls from the service worker (not content scripts)

## Flow

### 1. Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "AccountPass1!",
  "kdf": {
    "algorithm": "pbkdf2-sha256",
    "iterations": 600000,
    "salt": "<client-generated-base64-salt>"
  }
}
```

### 2. Login

```http
POST /api/v1/auth/login

{
  "email": "user@example.com",
  "password": "AccountPass1!"
}
```

Response includes `access_token` (15 min) and `refresh_token` (30 days).

### Forgot account password

```http
POST /api/v1/auth/forgot-password

{ "email": "user@example.com" }
```

- Always returns **202** with a generic message (no email enumeration).
- Sends an 8-character reset code by email (or logs to console when `EMAIL_PROVIDER=console`).
- Per-email cooldown between requests.

### Reset account password

```http
POST /api/v1/auth/reset-password

{
  "email": "user@example.com",
  "code": "AB12CD34",
  "new_password": "NewAccountPass1!"
}
```

- Returns **204** on success.
- Revokes all refresh tokens for the user.
- Clears account lockout.
- **Does not change** `users.kdf_*` (master-password KDF metadata).

Error codes: `RESET_CODE_INVALID`, `RESET_CODE_EXPIRED`, `RESET_THROTTLED`.

### 3. Register device

```http
POST /api/v1/devices
Authorization: Bearer <access_token>

{
  "device_name": "My Chrome",
  "device_type": "browser",
  "device_identifier": "<stable-client-generated-id>"
}
```

### 4. Download encrypted vault

```http
GET /api/v1/vault
Authorization: Bearer <access_token>
If-None-Match: <etag>    # optional, returns 304 if unchanged
```

### 5. Unlock/decrypt locally

Use KDF params from `GET /api/v1/auth/me` + master password. See [CLIENT_CRYPTO.md](CLIENT_CRYPTO.md).

### 6. Modify vault locally

Edit the decrypted JSON. Re-encrypt with the DEK.

### 7. Upload encrypted vault

```http
PUT /api/v1/vault
Authorization: Bearer <access_token>

{
  "encrypted_vault": "<base64>",
  "wrapped_vault_key": "<base64>",
  "vault_version": 1,
  "base_revision": 15,
  "client_mutation_id": "<uuid>",
  "device_id": "<device-uuid>",
  "recovery_wrapped_vault_key": "<base64>",
  "recovery_salt": "<base64>",
  "recovery_kdf_algorithm": "pbkdf2-sha256",
  "recovery_kdf_iterations": 600000
}
```

- `base_revision: 0` means "no vault exists yet" (first upload).
- Include `client_mutation_id` on every upload for safe retries.
- **Always send `wrapped_vault_key`** on every PUT (omitting it nulls the field).
- **Recovery fields are preserve-on-omit:** omit them on routine sync uploads to keep the existing recovery wrap; include them when creating, rotating, or backfilling a recovery key.

### Delete vault (destructive)

```http
DELETE /api/v1/vault
Authorization: Bearer <access_token>

{
  "password": "AccountPass1!",
  "confirm": "DELETE"
}
```

- Returns **204** (idempotent if vault already absent).
- Requires correct account password.
- Deletes vault row and the user's sync events.
- Client must wipe local vault state and route to fresh setup.

### 8. Detect remote changes

Poll periodically:

```http
GET /api/v1/sync?since_revision=15
Authorization: Bearer <access_token>
```

If `current_revision` > local revision, fetch the vault.

### 9. Continue using local vault

On **409 Conflict**: fetch latest vault, merge locally, re-upload with updated `base_revision`.

## Token refresh

Single-flight the refresh call in the service worker:

```http
POST /api/v1/auth/refresh

{ "refresh_token": "<token>" }
```

- `401 ACCESS_TOKEN_EXPIRED` → refresh and retry
- `401 ACCESS_TOKEN_INVALID` → hard logout
- `401 REFRESH_TOKEN_REUSED` (outside grace window) → hard logout

## CORS note

Chrome MV3 service workers with matching `host_permissions` bypass CORS. Content scripts must relay through the service worker.

## Manifest example

```json
{
  "host_permissions": ["https://api.your-domain.com/*"],
  "background": { "service_worker": "background.js" }
}
```

Use a **stable production API URL**, not Vercel preview URLs.
