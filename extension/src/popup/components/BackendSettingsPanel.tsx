import { useCallback, useEffect, useMemo, useState } from "react";
import { bg } from "../api";
import { isUnencryptedHttpUrl, normalizeApiBaseUrl } from "../../shared/api-url-validation";
import { ExtensionError } from "../../shared/errors";

type ApiBaseUrlInfo = {
  url: string;
  isDefault: boolean;
  defaultUrl: string;
};

type Props = {
  onAdvancedOpenChange?: (open: boolean) => void;
};

export function BackendSettingsPanel({ onAdvancedOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ApiBaseUrlInfo | null>(null);
  const [draft, setDraft] = useState("");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"test" | "save" | "reset" | null>(null);

  const load = useCallback(async () => {
    const res = await bg<ApiBaseUrlInfo>({ type: "GET_API_BASE_URL" });
    if (res.ok && res.data) {
      setActive(res.data);
      setDraft(res.data.url);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    onAdvancedOpenChange?.(open);
  }, [open, onAdvancedOpenChange]);

  const normalizedDraft = useMemo(() => {
    try {
      return normalizeApiBaseUrl(draft);
    } catch {
      return null;
    }
  }, [draft]);

  const draftChanged = useMemo(() => {
    if (!active || !normalizedDraft) return false;
    return normalizedDraft !== active.url;
  }, [active, normalizedDraft]);

  const httpWarning =
    normalizedDraft && isUnencryptedHttpUrl(normalizedDraft)
      ? "Connection is not encrypted."
      : null;

  async function handleTest() {
    setError(null);
    setTestMessage(null);
    setTestOk(null);
    let url: string;
    try {
      url = normalizeApiBaseUrl(draft);
    } catch (err) {
      setError(err instanceof ExtensionError ? err.message : "Invalid server URL.");
      return;
    }
    setBusy("test");
    const res = await bg<{ ok: boolean; message: string }>({
      type: "TEST_API_CONNECTION",
      url,
    });
    setBusy(null);
    if (res.ok && res.data) {
      setTestOk(res.data.ok);
      setTestMessage(res.data.message);
    } else {
      setTestOk(false);
      setTestMessage(res.error ?? "Connection test failed.");
    }
  }

  async function handleSave() {
    if (!normalizedDraft || !draftChanged) return;
    const confirmed = window.confirm(
      `Switch server to ${normalizedDraft}? Local vault data for the previous server will be removed from this browser.`
    );
    if (!confirmed) return;

    setError(null);
    setTestMessage(null);
    setTestOk(null);
    setBusy("save");
    const res = await bg<ApiBaseUrlInfo>({
      type: "SET_API_BASE_URL",
      url: normalizedDraft,
    });
    setBusy(null);
    if (res.ok && res.data) {
      setActive({
        url: res.data.url,
        isDefault: res.data.isDefault,
        defaultUrl: active?.defaultUrl ?? res.data.url,
      });
      setDraft(res.data.url);
    } else {
      setError(res.error ?? "Failed to save server URL.");
    }
  }

  async function handleReset() {
    if (!active || active.isDefault) return;
    const confirmed = window.confirm(
      `Reset server to ${active.defaultUrl}? Local vault data for the previous server will be removed from this browser.`
    );
    if (!confirmed) return;

    setError(null);
    setTestMessage(null);
    setTestOk(null);
    setBusy("reset");
    const res = await bg<ApiBaseUrlInfo>({ type: "RESET_API_BASE_URL" });
    setBusy(null);
    if (res.ok && res.data) {
      setActive({
        url: res.data.url,
        isDefault: res.data.isDefault,
        defaultUrl: active.defaultUrl,
      });
      setDraft(res.data.url);
    } else {
      setError(res.error ?? "Failed to reset server URL.");
    }
  }

  const disabled = busy !== null;

  return (
    <div className="backend-settings">
      {active && (
        <p className="muted backend-settings__active">
          Server: {active.url}{" "}
          <span className="backend-settings__tag">
            {active.isDefault ? "(default)" : "(custom)"}
          </span>
        </p>
      )}
      <button
        type="button"
        className="link backend-settings__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Hide advanced" : "Advanced"}
      </button>
      {open && (
        <div className="backend-settings__panel">
          <div className="field">
            <label htmlFor="backend-url">Server URL</label>
            <input
              id="backend-url"
              type="url"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                setTestMessage(null);
                setTestOk(null);
                setError(null);
              }}
              placeholder="https://vaultsync.example.com"
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
            <button
              type="button"
              className="btn"
              onClick={() => void handleSave()}
              disabled={disabled || !draftChanged}
            >
              {busy === "save" ? "Saving…" : "Save"}
            </button>
          </div>
          {active && !active.isDefault && (
            <p style={{ marginTop: 8 }}>
              <button
                type="button"
                className="link"
                onClick={() => void handleReset()}
                disabled={disabled}
              >
                {busy === "reset" ? "Resetting…" : "Reset to default"}
              </button>
            </p>
          )}
          {testMessage && (
            <p className={testOk ? "backend-settings__success" : "error"}>{testMessage}</p>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      )}
    </div>
  );
}
