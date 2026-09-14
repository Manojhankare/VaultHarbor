# Import & Export

VaultHarbor import and export runs **entirely in the browser**. Files are never uploaded to the server.

## Location

Full-screen vault → **Tools → Security** → **Import & Export** or **Encrypted backup**

## Supported import formats

| Format | Detection |
|--------|-----------|
| Chrome / Google Password Manager CSV | `name,url,username,password` |
| Bitwarden CSV | `type`, `login_uri`, … |
| LastPass CSV | `url,username,password,name,grouping,extra` |
| NordPass CSV | `name,username,password,url,note` |
| 1Password CSV | `Title,Website,Username,Password,Notes,Type` |
| Firefox CSV | `url,username,password,guid,…` |
| Generic CSV | Manual column mapping |
| VaultHarbor CSV / JSON | Round-trip export formats |
| Encrypted VaultHarbor Backup (`.vhbak`) | `format: vaultharbor-backup` (password required) |

## Import flow

1. Choose a file in the import dialog, then **Import** starts detection → parse → validate
2. Duplicate detection (vault + within file)
3. **Items table** — all rows with status badges (New, In vault, In file, Invalid); filter chips and type tabs
4. **Invalid review** (if any) — edit fields to fix or skip each invalid row
5. Duplicate decision **only if duplicates exist** (skip, import as new, or review)
6. Atomic commit via background import session → encrypt → **auto-sync to server**
7. Import report shows sync success or a specific failure reason; **Sync now** retries from the report

**No overwrite:** existing vault items are never modified. Duplicates are skipped or imported as new items.

**Export** does not change the vault and does not trigger sync.

## Export formats (v1)

- **VaultHarbor CSV** — interoperability (plaintext)
- **JSON** — portable item export (plaintext)
- **Encrypted VaultHarbor Backup (`.vhbak`)** — password-protected round-trip for VaultHarbor only

Scope for CSV/JSON: entire vault, current item, folder (`custom_fields.folder`), or the current selection. The export dialog asks you to confirm that the file contains plaintext passwords, then keeps a download confirmation on screen.

Encrypted backup is always the entire vault (logins and secure notes). It is created from **Tools → Security → Encrypted backup**, not from the plaintext Export dialog.

## Encrypted backup (`.vhbak`)

The file never leaves the browser except as a download. The server does not see it.

Envelope (`format: "vaultharbor-backup"`, `version: 1`):

- Random salt stored as a **base64 string** (the same string is the PBKDF2 salt; it is not decoded to bytes before derivation)
- PBKDF2-SHA256, 600000 iterations → backup KEK
- New random DEK, wrapped with AES-256-GCM (`wrapped_dek`)
- VaultHarbor JSON payload encrypted with AES-256-GCM (`encrypted_payload`)

The backup password is chosen at export time. It is not the account login password and is not stored. A wrong password or a tampered file fails decryption with no partial plaintext.

**Restore adds items** into the current vault (same duplicate / invalid review as other imports). It does not replace or wipe the vault. Other password managers cannot open `.vhbak`. Use CSV to move items elsewhere.

Detection order on import: encrypted backup envelope → if the file claims `vaultharbor-backup` but is invalid, stop (do not parse as CSV) → VaultHarbor JSON → CSV.

## Security

- Parsing and export generation run in the vault tab
- Passwords are not shown in import preview
- Imported items use the same encryption and sync path as manual creates
- No credentials in logs or backend API calls

## Folder preservation (v1)

External folder paths are stored in `custom_fields.folder` via an isolated folder bridge for future first-class folders.
