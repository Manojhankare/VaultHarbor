import { useId, useState } from "react";
import { isUnencryptedHttpUrl } from "../../shared/api-url-validation";
import type { useBackendSettings } from "../hooks/useBackendSettings";

type Settings = ReturnType<typeof useBackendSettings>;

type Props = {
  settings: Settings;
  onClose: () => void;
};

function LockBadge({ secure }: { secure: boolean }) {
  return (
    <span className={`conn-panel__badge${secure ? " conn-panel__badge--secure" : ""}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M17 8h-1V6a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Zm-3 0H10V6a2 2 0 0 1 4 0v2Z"
        />
      </svg>
      {secure ? "Secure" : "Not secure"}
    </span>
  );
}

function CloudArt() {
  const gradId = useId().replace(/:/g, "");

  return (
    <div className="conn-panel__art" aria-hidden="true">
      <svg viewBox="0 0 200 112" className="conn-panel__cloud-svg">
        <defs>
          <linearGradient id={gradId} x1="50" y1="20" x2="150" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0ec9fc" />
            <stop offset="100%" stopColor="#0090f8" />
          </linearGradient>
        </defs>
        <g fill={`url(#${gradId})`}>
          <ellipse cx="100" cy="74" rx="76" ry="28" />
          <circle cx="56" cy="60" r="30" />
          <circle cx="98" cy="46" r="36" />
          <circle cx="146" cy="58" r="28" />
          <circle cx="122" cy="40" r="24" />
        </g>
        <circle cx="100" cy="58" r="26" fill="rgba(10, 18, 32, 0.5)" />
        <circle cx="100" cy="58" r="20" fill="#22c55e" opacity="0.9" />
        <path
          d="M91 58l6 6 13-13"
          stroke="#fff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="conn-option__chevron" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 6l6 6-6 6" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="conn-option__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 4h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm0 10h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Zm2 2v2h2v-2H6Zm0-10v2h2V6H6Zm0 10v2h2v-2H6Z"
      />
    </svg>
  );
}

export function ConnectionSettingsFull({ settings, onClose }: Props) {
  const [view, setView] = useState<"pick" | "custom">("pick");
  const {
    active,
    draft,
    setDraft,
    testMessage,
    testOk,
    error,
    busy,
    disabled,
    draftChanged,
    canSave,
    httpWarning,
    clearFeedback,
    handleTest,
    handleSave,
    selectCloud,
  } = settings;

  const cloudUrl = active?.defaultUrl ?? draft;
  const urlForSecure = active?.url ?? draft;
  const isSecure = urlForSecure.trim() ? !isUnencryptedHttpUrl(urlForSecure) : true;

  async function pickCloud() {
    if (active?.isDefault) return;
    const ok = await selectCloud();
    if (ok) onClose();
  }

  async function saveCustom() {
    const ok = await handleSave();
    if (ok) onClose();
  }

  return (
    <aside className="conn-panel" aria-label="Connection settings">
      <div className="conn-panel__header">
        <h2 className="conn-panel__title">Connection</h2>
        <LockBadge secure={isSecure} />
        <button type="button" className="conn-panel__close link" onClick={onClose}>
          Close
        </button>
      </div>

      {view === "pick" ? (
        <>
          <CloudArt />
          <button
            type="button"
            className={`conn-option${active?.isDefault ? " conn-option--active" : ""}`}
            onClick={() => void pickCloud()}
            disabled={disabled}
          >
            <div className="conn-option__body">
              <div className="conn-option__head">
                <strong>VaultHarbor Cloud</strong>
                <span className="conn-option__tag">Recommended</span>
              </div>
              <p className="conn-option__desc">Fast, reliable and always up-to-date.</p>
              <span className="conn-option__url">{cloudUrl}</span>
            </div>
          </button>

          <div className="conn-panel__or">
            <span>OR</span>
          </div>

          <button
            type="button"
            className={`conn-option conn-option--row${!active?.isDefault ? " conn-option--active" : ""}`}
            onClick={() => {
              clearFeedback();
              setView("custom");
            }}
          >
            <ServerIcon />
            <div className="conn-option__body">
              <strong>Self-hosted / Custom server</strong>
              <p className="conn-option__desc">Connect to your own server.</p>
            </div>
            <ChevronIcon />
          </button>

          <p className="conn-panel__info">
            <span className="conn-panel__info-icon" aria-hidden="true">
              i
            </span>
            You can change this anytime from Settings.
          </p>
        </>
      ) : (
        <div className="conn-panel__custom">
          <button type="button" className="link conn-panel__back" onClick={() => setView("pick")}>
            ← Back
          </button>
          <h3 className="conn-panel__subtitle">Custom server</h3>
          <p className="muted conn-panel__hint">Enter your self-hosted VaultHarbor API URL.</p>
          <div className="field">
            <label htmlFor="conn-custom-url">Server URL</label>
            <input
              id="conn-custom-url"
              type="url"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                clearFeedback();
              }}
              placeholder="https://your-server.example.com"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled}
            />
          </div>
          {httpWarning && <p className="muted backend-settings__warn">{httpWarning}</p>}
          <div className="backend-settings__actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => void handleTest()}
              disabled={disabled || !draft.trim()}
            >
              {busy === "test" ? "Testing…" : "Test connection"}
            </button>
            {canSave && (
              <button
                type="button"
                className="btn"
                onClick={() => void saveCustom()}
                disabled={disabled}
              >
                {busy === "save" ? "Saving…" : "Save"}
              </button>
            )}
          </div>
          {testMessage && (
            <p className={testOk ? "backend-settings__success" : "error"}>{testMessage}</p>
          )}
          {!canSave && !testMessage && draft.trim() && draftChanged && (
            <p className="muted conn-panel__hint">Test the connection before saving.</p>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </aside>
  );
}
