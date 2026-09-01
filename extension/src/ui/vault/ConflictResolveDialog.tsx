import { useEffect, useState } from "react";
import { bg } from "../../popup/api";
import { LoadingButton, LoadingSpinner } from "../../popup/components/LoadingSpinner";
import type { ConflictDiffSummary } from "../../shared/messages";
import { ConflictDiffTable } from "./ConflictDiffTable";

type Props = {
  onClose: () => void;
  onResolve: (choice: "keep_local" | "keep_remote") => Promise<void>;
};

function resolvingLabel(
  choice: "keep_local" | "keep_remote",
  vaultsMatch: boolean
): string {
  if (vaultsMatch) return "Finishing sync…";
  if (choice === "keep_remote") return "Applying server copy…";
  return "Uploading this device…";
}

export function ConflictResolveDialog({ onClose, onResolve }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<ConflictDiffSummary | null>(null);
  const [resolving, setResolving] = useState<"keep_local" | "keep_remote" | null>(
    null
  );

  useEffect(() => {
    void bg({ type: "PAUSE_AUTO_LOCK" });
    return () => {
      void bg({ type: "RESUME_AUTO_LOCK" });
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError(null);
      const res = await bg<ConflictDiffSummary | null>({ type: "GET_CONFLICT_DETAILS" });
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Could not load conflict details");
        return;
      }
      setDetails(res.data ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const vaultsMatch = details !== null && details.totalDifferences === 0;
  const busy = loading || resolving !== null;

  async function handleResolve(choice: "keep_local" | "keep_remote") {
    setResolving(choice);
    setError(null);
    try {
      await onResolve(choice);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not resolve conflict"
      );
      setResolving(null);
    }
  }

  return (
    <div className="vh-modal-backdrop" role="dialog" aria-modal="true">
      <div className={`vh-modal vh-modal--wide${resolving ? " vh-modal--busy" : ""}`}>
        {resolving && (
          <div className="vh-modal__busy" aria-live="polite">
            <LoadingSpinner size="lg" label={resolvingLabel(resolving, vaultsMatch)} />
            <p className="vh-modal__busy-text">
              {resolvingLabel(resolving, vaultsMatch)}
            </p>
          </div>
        )}

        <h2>Resolve sync conflict</h2>
        {vaultsMatch ? (
          <p className="muted">
            Your passwords are the same on this device and on the server. This usually
            happens when two syncs ran at the same time — not because anything was lost.
          </p>
        ) : (
          <p className="muted">
            Your vault on this device and the copy on the server both changed. Review the
            differences below, then choose which full copy to keep.
          </p>
        )}

        {vaultsMatch && !loading && (
          <div className="vh-banner vh-banner--warn">
            No password changes differ — click <strong>Continue</strong> to clear this
            warning and finish syncing.
          </div>
        )}

        {loading && (
          <div className="vh-modal__loading">
            <LoadingSpinner size="md" label="Loading differences" />
            <span className="muted">Loading differences…</span>
          </div>
        )}
        {error && <p className="vh-banner vh-banner--error">{error}</p>}
        {!loading && !error && details && <ConflictDiffTable summary={details} />}

        <div className="actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          {vaultsMatch ? (
            <LoadingButton
              type="button"
              className="btn"
              loading={resolving === "keep_remote"}
              loadingLabel="Finishing sync…"
              disabled={busy && resolving !== "keep_remote"}
              onClick={() => void handleResolve("keep_remote")}
            >
              Continue
            </LoadingButton>
          ) : (
            <>
              <LoadingButton
                type="button"
                className="btn btn-secondary"
                loading={resolving === "keep_remote"}
                loadingLabel="Applying server copy…"
                disabled={busy && resolving !== "keep_remote"}
                onClick={() => void handleResolve("keep_remote")}
              >
                Keep server
              </LoadingButton>
              <LoadingButton
                type="button"
                className="btn"
                loading={resolving === "keep_local"}
                loadingLabel="Uploading this device…"
                disabled={busy && resolving !== "keep_local"}
                onClick={() => void handleResolve("keep_local")}
              >
                Keep this device
              </LoadingButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
