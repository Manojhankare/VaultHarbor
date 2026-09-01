import { useEffect, useState } from "react";
import type {
  ClassifiedImportRow,
  ImportItemType,
  NormalizedImportRecord,
} from "../../../import/types";
import { getInvalidReason } from "../../../import/validate-record";

type Props = {
  rows: ClassifiedImportRow[];
  skips: Record<string, true>;
  onSkip: (id: string) => void;
  onUnskip: (id: string) => void;
  onSave: (id: string, record: NormalizedImportRecord) => { ok: boolean; reason?: string | null };
};

export function InvalidReviewList({ rows, skips, onSkip, onUnskip, onSave }: Props) {
  if (rows.length === 0) {
    return (
      <p className="muted">All invalid rows were fixed. Continue to finish import.</p>
    );
  }

  const pending = rows.filter((r) => !skips[r.id]).length;

  return (
    <div className="vh-import-review vs-scrollbar">
      <p className="vh-import-review__progress">
        {rows.length - pending} of {rows.length} decided ({pending} still need a choice)
      </p>
      {rows.map((row) => (
        <InvalidRowEditor
          key={row.id}
          row={row}
          skipped={skips[row.id] === true}
          onSkip={() => onSkip(row.id)}
          onUnskip={() => onUnskip(row.id)}
          onSave={(record) => onSave(row.id, record)}
        />
      ))}
    </div>
  );
}

function InvalidRowEditor({
  row,
  skipped,
  onSkip,
  onUnskip,
  onSave,
}: {
  row: ClassifiedImportRow;
  skipped: boolean;
  onSkip: () => void;
  onUnskip: () => void;
  onSave: (record: NormalizedImportRecord) => { ok: boolean; reason?: string | null };
}) {
  const [draft, setDraft] = useState<NormalizedImportRecord>(() => ({ ...row.record }));
  const [localError, setLocalError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setDraft({ ...row.record });
    setLocalError(row.invalidReason ?? null);
  }, [row.id, row.record, row.invalidReason]);

  function setField<K extends keyof NormalizedImportRecord>(
    key: K,
    value: NormalizedImportRecord[K]
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setLocalError(null);
  }

  function handleSave() {
    const reason = getInvalidReason(draft);
    if (reason) {
      setLocalError(reason);
      return;
    }
    const result = onSave(draft);
    if (!result.ok) {
      setLocalError(result.reason ?? "Could not save this row.");
    }
  }

  return (
    <div className={`vh-import-review__item${skipped ? " is-decided" : ""}`}>
      <div className="vh-import-review__header">
        <p className="muted" style={{ margin: 0 }}>
          Row {row.record.rowIndex}
        </p>
        <span className="vh-import-dup-badge vh-import-dup-badge--invalid">Invalid</span>
      </div>
      <p className="vh-import-review__detail muted">
        {skipped
          ? "Skipped — will not be imported."
          : localError ?? row.invalidReason ?? "This row is incomplete."}
      </p>

      {!skipped && (
        <div className="vh-import-invalid-form">
          <label className="field">
            <span>Type</span>
            <select
              value={draft.type}
              onChange={(e) => setField("type", e.target.value as ImportItemType)}
            >
              <option value="login">Password / login</option>
              <option value="secure_note">Secure note</option>
            </select>
          </label>
          <label className="field">
            <span>Title</span>
            <input
              value={draft.title ?? ""}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="Required for notes; recommended for logins"
            />
          </label>
          {draft.type === "login" ? (
            <>
              <label className="field">
                <span>Website</span>
                <input
                  value={draft.website ?? ""}
                  onChange={(e) => setField("website", e.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <label className="field">
                <span>Username</span>
                <input
                  value={draft.username ?? ""}
                  onChange={(e) => setField("username", e.target.value)}
                />
              </label>
              <label className="field">
                <span>Password</span>
                <div className="vh-import-invalid-form__secret">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={draft.password ?? ""}
                    onChange={(e) => setField("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="vh-import-secret__toggle"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </label>
              <label className="field">
                <span>Notes</span>
                <textarea
                  value={draft.loginNotes ?? ""}
                  onChange={(e) => setField("loginNotes", e.target.value)}
                  rows={2}
                />
              </label>
            </>
          ) : (
            <label className="field">
              <span>Content</span>
              <textarea
                value={draft.secureNoteContent ?? ""}
                onChange={(e) => setField("secureNoteContent", e.target.value)}
                rows={4}
                placeholder="Secure note body (required)"
              />
            </label>
          )}
          <label className="field">
            <span>Folder</span>
            <input
              value={draft.folder ?? ""}
              onChange={(e) => setField("folder", e.target.value)}
            />
          </label>
        </div>
      )}

      <div className="vh-import-review__choices" role="group" aria-label="Invalid row action">
        {skipped ? (
          <button type="button" className="vh-import-choice" onClick={onUnskip}>
            Edit again
          </button>
        ) : (
          <>
            <button type="button" className="vh-import-choice" onClick={onSkip}>
              Skip
            </button>
            <button
              type="button"
              className="vh-import-choice vh-import-choice--import"
              onClick={handleSave}
            >
              Save &amp; include
            </button>
          </>
        )}
      </div>
    </div>
  );
}
