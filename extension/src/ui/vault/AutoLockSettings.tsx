import { useCallback, useEffect, useState } from "react";
import { bg } from "../../popup/api";
import type { AutoLockMinutesOption } from "../../shared/constants";

type AutoLockSettingsData = {
  minutes: AutoLockMinutesOption;
  options: readonly AutoLockMinutesOption[];
  sessionDisabled: boolean;
};

const LABELS: Record<AutoLockMinutesOption, string> = {
  5: "5 minutes",
  15: "15 minutes",
  30: "30 minutes",
  60: "60 minutes",
};

export function AutoLockSettings() {
  const [settings, setSettings] = useState<AutoLockSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await bg<AutoLockSettingsData>({ type: "GET_AUTO_LOCK_SETTINGS" });
    if (res.ok && res.data) {
      setSettings(res.data);
    } else {
      setError(res.error ?? "Could not load auto-lock settings.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 2000);
    return () => window.clearTimeout(timer);
  }, [saved]);

  async function changeTimeout(minutes: AutoLockMinutesOption) {
    if (!settings || settings.minutes === minutes) return;
    setSaving(true);
    setError(null);
    const res = await bg<AutoLockSettingsData>({
      type: "SET_AUTO_LOCK_SETTINGS",
      minutes,
    });
    setSaving(false);
    if (res.ok && res.data) {
      setSettings(res.data);
      setSaved(true);
    } else {
      setError(res.error ?? "Could not save auto-lock setting.");
    }
  }

  async function disableForSession() {
    setSaving(true);
    setError(null);
    const res = await bg<AutoLockSettingsData>({ type: "DISABLE_AUTO_LOCK_SESSION" });
    setSaving(false);
    if (res.ok && res.data) {
      setSettings(res.data);
      setSaved(true);
    } else {
      setError(res.error ?? "Could not disable auto-lock.");
    }
  }

  async function enableForSession() {
    setSaving(true);
    setError(null);
    const res = await bg<AutoLockSettingsData>({ type: "ENABLE_AUTO_LOCK_SESSION" });
    setSaving(false);
    if (res.ok && res.data) {
      setSettings(res.data);
      setSaved(true);
    } else {
      setError(res.error ?? "Could not re-enable auto-lock.");
    }
  }

  if (loading) {
    return (
      <section className="vh-settings-section">
        <h3 className="vh-settings-section__title">Auto-lock</h3>
        <p className="muted">Loading…</p>
      </section>
    );
  }

  if (!settings) {
    return (
      <section className="vh-settings-section">
        <h3 className="vh-settings-section__title">Auto-lock</h3>
        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  return (
    <section className="vh-settings-section">
      <h3 className="vh-settings-section__title">Auto-lock</h3>
      <p className="muted vh-settings-section__desc">
        Lock the vault after this much inactivity while it is unlocked. Checks run about every
        minute, so lock may occur shortly after the chosen time.
      </p>

      <label className="vh-settings-field">
        <span className="vh-settings-field__label">Idle timeout</span>
        <select
          className="vh-settings-field__select"
          value={settings.minutes}
          disabled={saving}
          aria-label="Auto-lock idle timeout"
          onChange={(e) => void changeTimeout(Number(e.target.value) as AutoLockMinutesOption)}
        >
          {settings.options.map((minutes) => (
            <option key={minutes} value={minutes}>
              {LABELS[minutes]}
            </option>
          ))}
        </select>
      </label>

      {saved && <p className="vh-settings-section__saved">Saved</p>}
      {error && <p className="error">{error}</p>}

      <div className="vh-settings-section__session">
        <h4 className="vh-settings-section__subtitle">This browser session</h4>
        {settings.sessionDisabled ? (
          <>
            <p className="vh-settings-section__badge">Auto-lock disabled for this session</p>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => void enableForSession()}
            >
              Re-enable auto-lock
            </button>
          </>
        ) : (
          <>
            <p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
              Skip auto-lock until you lock the vault, log out, or close the browser.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              disabled={saving}
              onClick={() => void disableForSession()}
            >
              Don&apos;t auto-lock until I close the browser
            </button>
          </>
        )}
      </div>
    </section>
  );
}
