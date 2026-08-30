# Sync

## Model

Single encrypted blob per user, monotonic `revision`, optimistic locking via `base_revision` in `PUT /vault` body.

## Client flow

### On login

1. Register device
2. `GET /vault` (404 = empty vault)
3. Store encrypted blob in IndexedDB

### On change

1. Modify decrypted vault locally
2. Encrypt with DEK
3. `PUT /vault` with `base_revision`, `client_mutation_id`, **`wrapped_vault_key`**
4. Update local revision + ETag

### Poll

`chrome.alarms` every ~1 minute → `GET /sync?since_revision=N` → fetch vault if `current_revision` advanced.

## Conflicts (409)

1. Fetch latest server vault
2. Merge per-item last-write-wins on `updated_at`; tombstones win ties
3. If `wrapped_vault_key` changed and local DEK cannot unwrap → lock vault (master password changed elsewhere)
4. Surface conflict to user (full-screen vault **Resolve** banner; `RESOLVE_CONFLICT` keep local / keep remote); never silently discard credentials

## Offline

Changes queued in IndexedDB `pending` store. Popup shows pending count. Sync on reconnect or manual Sync button.

## Idempotency

Fresh `client_mutation_id` per distinct upload; reuse only when retrying the same payload.
