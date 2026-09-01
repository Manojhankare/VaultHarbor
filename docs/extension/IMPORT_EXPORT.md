# Import & Export

VaultHarbor import and export runs **entirely in the browser**. Files are never uploaded to the server.

## Location

Full-screen vault → **Tools → Security** → **Import & Export**

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

## Import flow

1. Select file → format detection → parse → validate
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

Scope: entire vault, current item, or folder (`custom_fields.folder`).

**Encrypted VaultHarbor Backup** — planned; not in v1.

## Security

- Parsing and export generation run in the vault tab
- Passwords are not shown in import preview
- Imported items use the same encryption and sync path as manual creates
- No credentials in logs or backend API calls

## Folder preservation (v1)

External folder paths are stored in `custom_fields.folder` via an isolated folder bridge for future first-class folders.
