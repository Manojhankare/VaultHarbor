import { useCallback, useEffect, useMemo, useState } from "react";
import { bg } from "../api";
import { isUnencryptedHttpUrl, normalizeApiBaseUrl } from "../../shared/api-url-validation";
import { ExtensionError } from "../../shared/errors";

export type ApiBaseUrlInfo = {
  url: string;
  isDefault: boolean;
  defaultUrl: string;
};

export function useBackendSettings() {
  const [active, setActive] = useState<ApiBaseUrlInfo | null>(null);
  const [draft, setDraft] = useState("");
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [testOk, setTestOk] = useState<boolean | null>(null);
  const [testedUrl, setTestedUrl] = useState<string | null>(null);
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

  const canSave = draftChanged && testOk === true && normalizedDraft === testedUrl;

  const httpWarning =
    normalizedDraft && isUnencryptedHttpUrl(normalizedDraft)
      ? "Connection is not encrypted."
      : null;

  const disabled = busy !== null;

  function clearFeedback() {
    setTestMessage(null);
    setTestOk(null);
    setTestedUrl(null);
    setError(null);
  }

  async function handleTest() {
    clearFeedback();
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
      setTestedUrl(res.data.ok ? url : null);
    } else {
      setTestOk(false);
      setTestMessage(res.error ?? "Connection test failed.");
      setTestedUrl(null);
    }
  }

  async function handleSave(): Promise<boolean> {
    if (!normalizedDraft || !canSave) return false;
    const confirmed = window.confirm(
      `Switch server to ${normalizedDraft}? Local vault data for the previous server will be removed from this browser.`
    );
    if (!confirmed) return false;

    clearFeedback();
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
      return true;
    }
    setError(res.error ?? "Failed to save server URL.");
    return false;
  }

  async function handleReset(): Promise<boolean> {
    if (!active || active.isDefault) return false;
    const confirmed = window.confirm(
      `Reset server to ${active.defaultUrl}? Local vault data for the previous server will be removed from this browser.`
    );
    if (!confirmed) return false;

    clearFeedback();
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
      return true;
    }
    setError(res.error ?? "Failed to reset server URL.");
    return false;
  }

  async function selectCloud(): Promise<boolean> {
    return handleReset();
  }

  return {
    active,
    draft,
    setDraft,
    testMessage,
    testOk,
    error,
    busy,
    disabled,
    normalizedDraft,
    draftChanged,
    canSave,
    httpWarning,
    load,
    clearFeedback,
    handleTest,
    handleSave,
    handleReset,
    selectCloud,
  };
}
