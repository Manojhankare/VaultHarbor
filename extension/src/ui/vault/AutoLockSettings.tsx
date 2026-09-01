import { useCallback, useEffect, useState } from "react";
import { bg } from "../../popup/api";
import {
  IconLock,
  IconShield,
} from "../../popup/components/icons/Icon";
import type { AutoLockMinutesOption } from "../../shared/constants";
import { formatAutoLockMinutes } from "../../vault/auto-lock";

type AutoLockSettingsData = {
  minutes: AutoLockMinutesOption;
  options: readonly AutoLockMinutesOption[];
  sessionDisabled: boolean;
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

  async function setSessionDisabled(disabled: boolean) {
    if (!settings || settings.sessionDisabled === disabled) return;
    setSaving(true);
    setError(null);
    const res = await bg<AutoLockSettingsData>({
      type: disabled ? "DISABLE_AUTO_LOCK_SESSION" : "ENABLE_AUTO_LOCK_SESSION",
    });
    setSaving(false);
    if (res.ok && res.data) {
      setSettings(res.data);
      setSaved(true);
    } else {
      setError(res.error ?? "Could not update session auto-lock setting.");
    }
  }

  if (loading) {
    return (
      <section className="vh-security-card">
        <p className="muted">Loading auto-lock settings…</p>
      </section>
    );
  }

  if (!settings) {
    return (
      <section className="vh-security-card">
        {error && <p className="error">{error}</p>}
      </section>
    );
  }

  return (
    <>
      <section className="vh-security-card">
        <div className="vh-security-split">
          <div className="vh-security-split__left">
            <div className="vh-security-heading">
              <div className="vh-security-card__icon vh-security-card__icon--round" aria-hidden="true">
                <IconLock size={20} />
              </div>
              <h3 className="vh-security-card__title">Auto-lock</h3>
            </div>
            <p className="vh-security-card__desc">
              Lock the vault after a period of inactivity while it is unlocked. Checks run about
              every minute, so lock may occur shortly after the chosen time.
            </p>
          </div>
          <div className="vh-security-split__right">
            <label className="vh-security-field">
              <span className="vh-security-field__label">Idle timeout</span>
              <select
                className="vh-security-field__select"
                value={settings.minutes}
                disabled={saving}
                aria-label="Auto-lock idle timeout"
                onChange={(e) =>
                  void changeTimeout(Number(e.target.value) as AutoLockMinutesOption)
                }
              >
                {settings.options.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {formatAutoLockMinutes(minutes)}
                  </option>
                ))}
              </select>
            </label>
            <div className="vh-security-info">
              <IconShield size={16} />
              <span>You can still access your vault using your master password.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="vh-security-card">
        <div className="vh-security-split">
          <div className="vh-security-split__left">
            <div className="vh-security-heading">
              <div
                className="vh-security-card__icon vh-security-card__icon--round vh-security-card__icon--success"
                aria-hidden="true"
              >
                <IconShield size={20} />
              </div>
              <h3 className="vh-security-card__title">This browser session</h3>
            </div>
            <p className="vh-security-card__desc">
              Skip auto-lock until you lock the vault, log out, or close the browser.
            </p>
          </div>
          <div className="vh-security-split__right vh-security-split__right--wide vh-security-split__right--center">
            <div className="vh-security-control-box">
              <label className="vh-toggle vh-toggle--boxed">
                <IconLock size={18} />
                <span className="vh-toggle__label">
                  Don&apos;t auto-lock until I close the browser
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={settings.sessionDisabled}
                  disabled={saving}
                  aria-label="Don't auto-lock until I close the browser"
                  onChange={(e) => void setSessionDisabled(e.target.checked)}
                />
                <span className="vh-toggle__track" aria-hidden="true">
                  <span className="vh-toggle__thumb" />
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {saved && <p className="vh-security-saved">Saved</p>}
      {error && <p className="error vh-security-error">{error}</p>}
    </>
  );
}
