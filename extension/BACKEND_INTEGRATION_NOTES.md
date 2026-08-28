# VaultSync Backend Integration Notes

Source of truth: `backend/app/**` routes, schemas, and services. When this document
conflicts with assumptions in product specs, the backend wins.

**Author:** [Manoj Hankare](https://manojhankare.in)

Production API: `https://vaultsync.manojhankare.in`  
Development API: `http://localhost:5000`

## Response envelopes

**Success:** bare JSON object, e.g. `{"vault": {...}}`, `{"user": {...}}`.

**Error:**

```json
{
  "error": {
    "code": "VAULT_REVISION_CONFLICT",
    "message": "Vault has been modified on another device.",
    "details": { "current_revision": 11 }
  },
  "request_id": "..."
}
```

## Authentication

### POST /api/v1/auth/register

- Rate limit: 10/min
- Body: `{ email, password, kdf? }`
- Password: min 12 chars, upper + lower + digit + special
- Optional `kdf`: `{ algorithm, iterations, salt, memory_kib?, parallelism? }`
- **Returns 201 `{ user }` only — no tokens.** Client must call login next.
- 409 `REGISTRATION_CONFLICT` on duplicate email

### POST /api/v1/auth/login

- Rate limit: 20/min
- Body: `{ email, password, device_id? }`
- Returns: `{ access_token, refresh_token, token_type, expires_in }`
- Access token TTL: 900s (15 min) default
- Refresh token TTL: 2592000s (30 days) default
- `device_id` optional; device registration requires a token, so first login omits it

### POST /api/v1/auth/refresh

- Rate limit: 30/min
- Body: `{ refresh_token }`
- Returns new token pair (refresh rotation)
- `401 ACCESS_TOKEN_EXPIRED` → refresh and retry original request once
- `401 ACCESS_TOKEN_INVALID` → hard logout
- `401 REFRESH_TOKEN_INVALID` / `REFRESH_TOKEN_REUSED` → hard logout, revoke session family

### POST /api/v1/auth/logout

- Requires Bearer token
- Body: `{ refresh_token?, all_devices? }`
- Returns 204

### GET /api/v1/auth/me

- Requires Bearer token
- Returns `{ user: { id, email, is_active, created_at, last_login_at, kdf } }`
- KDF params used for master-password key derivation (not account password)

## Devices

### POST /api/v1/devices

- Body: `{ device_name, device_type, device_identifier }`
- `device_type`: `browser` | `desktop` | `mobile` | `other`
- `device_identifier`: 8–256 chars, stable client-generated id
- **Idempotent upsert** on `(user_id, device_identifier)` — reinstalls recover same row
- Returns 201 `{ device: { id, device_name, device_type, device_identifier, ... } }`

### GET /api/v1/devices

- Returns `{ devices: [...] }`

### DELETE /api/v1/devices/{id}

- Returns 204

### POST /api/v1/devices/{id}/heartbeat

- Updates `last_seen_at`

## Vault

### GET /api/v1/vault

- Rate limit: 120/min
- Optional header: `If-None-Match: <etag>` → 304 if unchanged
- Response includes `ETag` header (weak: `W/"sha256..."`)
- **404 `VAULT_NOT_FOUND`** = no vault yet (revision 0), not a fatal error
- Body: `{ vault: { encrypted_vault, wrapped_vault_key, vault_version, revision } }`

### PUT /api/v1/vault

- Rate limit: 60/min
- Body:
  ```json
  {
    "encrypted_vault": "<base64>",
    "wrapped_vault_key": "<base64>",
    "vault_version": 1,
    "base_revision": 15,
    "client_mutation_id": "<uuid>",
    "device_id": "<uuid>"
  }
  ```
- **No `If-Match` header.** Optimistic locking uses `base_revision` in body only.
- `base_revision: 0` = create new vault (first upload)
- **CRITICAL:** Always send `wrapped_vault_key` on every PUT. Omitting it nulls the field
  server-side and permanently destroys the wrapped DEK.
- `client_mutation_id`: fresh UUID per distinct upload; reuse only when retrying same payload
- 409 `VAULT_REVISION_CONFLICT` with `details.current_revision`
- 413 `PAYLOAD_TOO_LARGE` (max 2 MiB per blob)
- Returns 200 or 201 `{ vault: {...} }`

## Sync

### GET /api/v1/sync?since_revision=N&limit=50

- Rate limit: 120/min
- Returns:
  ```json
  {
    "current_revision": 11,
    "vault_version": 1,
    "changes": [{ "revision", "operation", "device_id", "created_at" }],
    "has_more": false
  }
  ```
- Poll when `current_revision` > local revision, then fetch vault

## Discrepancies vs. common assumptions

| Assumption | Actual contract |
|------------|-----------------|
| `If-Match` on PUT /vault | Body field `base_revision` only; ETag is GET-only |
| Register returns tokens | Returns `{ user }` only; login required |
| 404 on GET /vault is error | Normal first-run state (revision 0) |
| wrapped_vault_key optional on update | **Must resend every PUT** or DEK is destroyed |
| Login with device_id first | Device registration needs token; register device after first login |

## KDF salt encoding

`CLIENT_CRYPTO.md` describes salt as base64, but the server default uses
`secrets.token_urlsafe(16)` (base64url). **Client uses UTF-8 bytes of the salt string
as opaque input to PBKDF2.** Stable for client-supplied and server-generated salts.

## Crypto contract (client-side)

See `backend/docs/CLIENT_CRYPTO.md`. Summary:

- Master password → PBKDF2-SHA256 (iterations + salt from `/auth/me`) → KEK
- Random 256-bit DEK → AES-256-GCM encrypt vault JSON → `encrypted_vault`
- KEK wraps DEK → `wrapped_vault_key`
- Framing: `[12-byte IV][ciphertext + 16-byte GCM tag]`, base64-encoded
- Master password never sent to server

## CORS

Extension service workers with matching `host_permissions` bypass CORS.
`backend/.env.example` includes `CORS_ALLOWED_ORIGIN_REGEXES=^chrome-extension://.*$`.

## Error codes reference

| Code | Status | Action |
|------|--------|--------|
| ACCESS_TOKEN_EXPIRED | 401 | Refresh + retry once |
| ACCESS_TOKEN_INVALID | 401 | Hard logout |
| REFRESH_TOKEN_INVALID | 401 | Hard logout |
| REFRESH_TOKEN_REUSED | 401 | Hard logout |
| INVALID_CREDENTIALS | 401 | Show login error |
| VAULT_NOT_FOUND | 404 | Treat as empty vault |
| VAULT_REVISION_CONFLICT | 409 | Fetch latest, merge, re-upload |
| PAYLOAD_TOO_LARGE | 413 | Show size error |
| VALIDATION_ERROR | 422 | Show field errors |
| RATE_LIMIT_EXCEEDED | 429 | Back off |
| ACCOUNT_LOCKED | 429 | Show lockout message |
