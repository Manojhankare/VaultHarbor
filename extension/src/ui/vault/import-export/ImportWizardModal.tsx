import { useCallback, useEffect, useRef, useState } from "react";

import { bg } from "../../../popup/api";

import { LoadingButton } from "../../../popup/components/LoadingSpinner";

import type { VaultItemSummary } from "../../../shared/messages";

import type { DuplicateStrategy, ImportSummary, ReviewDecision } from "../../../import/types";

import { MAX_IMPORT_FILE_BYTES, MAX_IMPORT_ROWS } from "../../../import/types";

import { parseCsvContent } from "../../../import/csv";

import { detectCsvFormat } from "../../../import/detect-format";

import {

  parseGenericCsv,

  type GenericColumnMapping,

} from "../../../import/adapters/generic-csv";

import { parseVaultHarborJson, isVaultHarborJson } from "../../../import/adapters/vaultharbor-csv";

import { classifyImportRecords, getDuplicateRows } from "../../../import/duplicate-detection";

import {

  computeButtonLabel,

  computeSkippedCount,

  isReviewComplete,

  resolveImportCounts,

} from "../../../import/resolve-import-counts";

import { cancelImportSession, retrySyncAfterImport, runImportSession } from "./import-export-api";
import { duplicateSummaryLine } from "./duplicate-ui";
import { fetchVaultUnlocked, ImportVaultUnlockPanel } from "./ImportVaultUnlockPanel";
import { InvalidReviewList } from "./InvalidReviewList";
import { ImportItemsTable } from "./ImportItemsTable";
import {
  getInvalidRows,
  isInvalidReviewComplete,
  replaceRecordAndReclassify,
} from "../../../import/invalid-fix";
import type { NormalizedImportRecord } from "../../../import/types";

type WizardStep =
  | "pick"
  | "generic-map"
  | "processing"
  | "summary"
  | "invalid-review"
  | "duplicate-decision"
  | "review"
  | "confirm"
  | "progress"
  | "report";



type Props = {

  onClose: () => void;

  onDone: () => void;

};



const EMPTY_MAP: GenericColumnMapping = {};



export function ImportWizardModal({ onClose, onDone }: Props) {

  const fileRef = useRef<HTMLInputElement>(null);

  const importSessionRef = useRef<string | null>(null);

  const [step, setStep] = useState<WizardStep>("pick");

  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<ImportSummary | null>(null);

  const [vaultById, setVaultById] = useState<Map<string, VaultItemSummary>>(new Map());
  const [vaultItems, setVaultItems] = useState<VaultItemSummary[]>([]);
  const [invalidSkips, setInvalidSkips] = useState<Record<string, true>>({});
  const [skippedUnsupportedCount, setSkippedUnsupportedCount] = useState(0);

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);

  const [columnMap, setColumnMap] = useState<GenericColumnMapping>(EMPTY_MAP);

  const [strategy, setStrategy] = useState<DuplicateStrategy>("skip_duplicates");

  const [reviewDecisions, setReviewDecisions] = useState<Record<string, ReviewDecision>>({});

  const [progressPct, setProgressPct] = useState(0);

  const [committing, setCommitting] = useState(false);
  const [importProgressLabel, setImportProgressLabel] = useState("Importing…");
  const [syncRetrying, setSyncRetrying] = useState(false);

  const [report, setReport] = useState<{
    imported: number;
    skipped: number;
    invalid: number;
    unsupported: number;
    sync: { ok: true } | { ok: false; error: string; code?: string };
  } | null>(null);

  const [processingLabel, setProcessingLabel] = useState("");
  const [vaultLocked, setVaultLocked] = useState(false);

  useEffect(() => {
    void bg({ type: "PAUSE_AUTO_LOCK" });
    return () => {
      void bg({ type: "RESUME_AUTO_LOCK" });
    };
  }, []);

  const checkVaultUnlocked = useCallback(async (): Promise<boolean> => {
    const unlocked = await fetchVaultUnlocked();
    setVaultLocked(!unlocked);
    return unlocked;
  }, []);

  useEffect(() => {
    void checkVaultUnlocked();
    const interval = window.setInterval(() => {
      void checkVaultUnlocked();
    }, 30_000);
    function onVisible() {
      if (document.visibilityState === "visible") void checkVaultUnlocked();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [checkVaultUnlocked]);

  const finishClassification = useCallback(

    async (

      records: ImportSummary["rows"][0]["record"][],

      sourceLabel: string,

      unsupportedSkipped = 0

    ) => {

      setProcessingLabel("Checking for duplicates…");

      await new Promise((r) => setTimeout(r, 0));



      const vaultRes = await bg<VaultItemSummary[]>({
        type: "LIST_VAULT_ITEM_SUMMARIES_FOR_IMPORT",
      });
      const items = vaultRes.ok && vaultRes.data ? vaultRes.data : [];
      const byId = new Map(items.map((item) => [item.id, item]));

      const result = classifyImportRecords(records, items, sourceLabel);
      setVaultById(byId);
      setVaultItems(items);
      setSkippedUnsupportedCount(unsupportedSkipped);
      setSummary(result);
      setStrategy("skip_duplicates");
      setReviewDecisions({});
      setInvalidSkips({});
      setStep("summary");
    },
    []
  );



  const processFile = useCallback(

    async (file: { size: number; text(): Promise<string> }) => {

      setError(null);

      if (file.size > MAX_IMPORT_FILE_BYTES) {

        setError("File is too large (max 10 MB).");

        return;

      }



      setStep("processing");

      setProcessingLabel("Reading file…");

      const text = await file.text();



      await new Promise((r) => setTimeout(r, 0));



      if (isVaultHarborJson(text)) {

        setProcessingLabel("Parsing JSON…");

        const parsed = parseVaultHarborJson(text);

        if (parsed.records.length > MAX_IMPORT_ROWS) {

          setError(`Too many rows (max ${MAX_IMPORT_ROWS}).`);

          setStep("pick");

          return;

        }

        await finishClassification(

          parsed.records,

          "VaultHarbor JSON",

          parsed.skippedUnsupported.length

        );

        return;

      }



      const { headers, rows } = parseCsvContent(text);

      if (rows.length > MAX_IMPORT_ROWS) {

        setError(`Too many rows (max ${MAX_IMPORT_ROWS}).`);

        setStep("pick");

        return;

      }



      const detected = detectCsvFormat(headers);

      if (detected.kind === "known") {

        setProcessingLabel(`Parsing ${detected.adapter.label}…`);

        const parsed = detected.adapter.parse(rows, detected.adapter.label);

        await finishClassification(

          parsed.records,

          detected.adapter.label,

          parsed.skippedUnsupported.length

        );

        return;

      }



      setCsvHeaders(headers);

      setCsvRows(rows);

      setStep("generic-map");

    },

    [finishClassification]

  );



  useEffect(() => {

    return () => {

      if (importSessionRef.current) {

        void cancelImportSession(importSessionRef.current);

        importSessionRef.current = null;

      }

    };

  }, []);



  function handleGenericMapSubmit(e: React.FormEvent) {

    e.preventDefault();

    setStep("processing");

    setProcessingLabel("Parsing generic CSV…");

    void (async () => {

      const parsed = parseGenericCsv(csvRows, columnMap);

      await finishClassification(parsed.records, "Generic CSV", parsed.skippedUnsupported.length);

    })();

  }



  async function handleImportCommit() {
    if (!summary) return;
    const resolved = resolveImportCounts(summary, strategy, reviewDecisions);
    if (resolved.importCount === 0) {
      setError("No items selected for import.");
      return;
    }
    if (!(await checkVaultUnlocked())) {
      setError(null);
      setStep("confirm");
      return;
    }

    setStep("progress");
    setProgressPct(0);
    setImportProgressLabel("Importing…");
    setCommitting(true);
    setError(null);

    try {
      const commitResult = await runImportSession(
        resolved.logins,
        resolved.secureNotes,
        (done, total) => {
          setProgressPct(Math.round((done / total) * 100));
        },
        (sessionId) => {
          importSessionRef.current = sessionId;
        }
      );

      importSessionRef.current = null;
      setImportProgressLabel("Syncing to server…");
      setProgressPct(100);

      setReport({
        imported: resolved.importCount,
        skipped: computeSkippedCount(summary, strategy, reviewDecisions),
        invalid: summary.invalidCount,
        unsupported: skippedUnsupportedCount,
        sync: commitResult.sync,
      });
      setStep("report");

    } catch (err) {
      importSessionRef.current = null;
      const message = err instanceof Error ? err.message : "Import failed.";
      if (message.toLowerCase().includes("vault is locked")) {
        setVaultLocked(true);
        setError(null);
        setStep("confirm");
      } else {
        setError(message);
        setStep("confirm");
      }
    } finally {

      setCommitting(false);

    }

  }



  async function handleRetrySyncAfterImport() {
    setSyncRetrying(true);
    const sync = await retrySyncAfterImport();
    setSyncRetrying(false);
    setReport((prev) => (prev ? { ...prev, sync } : prev));
    if (sync.ok) {
      onDone();
    }
  }

  function goAfterSummary(nextSummary: ImportSummary = summary!) {
    if (nextSummary.invalidCount > 0) {
      setStep("invalid-review");
      return;
    }
    if (nextSummary.duplicateCount > 0) {
      setStep("duplicate-decision");
      return;
    }
    setStep("confirm");
  }

  function goAfterInvalidReview() {
    if (!summary) return;
    if (!isInvalidReviewComplete(summary, invalidSkips)) {
      setError("Fix or skip every invalid row before continuing.");
      return;
    }
    setError(null);
    if (summary.duplicateCount > 0) {
      setStep("duplicate-decision");
      return;
    }
    setStep("confirm");
  }

  function handleInvalidSave(id: string, record: NormalizedImportRecord) {
    if (!summary) return { ok: false, reason: "No import loaded." };
    const result = replaceRecordAndReclassify(summary, id, record, vaultItems);
    if (result.stillInvalid) {
      setSummary(result.summary);
      return { ok: false, reason: result.reason };
    }
    setSummary(result.summary);
    setInvalidSkips((prev) => {
      const next = { ...prev };
      delete next[id];
      for (const key of Object.keys(next)) {
        const row = result.summary.rows.find((r) => r.id === key);
        if (!row || row.status !== "invalid") delete next[key];
      }
      return next;
    });
    setReviewDecisions({});
    return { ok: true };
  }

  function handlePrimaryAction() {
    if (!summary) return;
    const btn = computeButtonLabel(
      summary,
      strategy,
      reviewDecisions,
      isReviewComplete(summary, reviewDecisions)
    );

    if (btn.action === "review") {
      setStep("review");
      return;
    }

    if (step === "summary") {
      goAfterSummary(summary);
      return;
    }

    setStep("confirm");
  }



  function closeWizard() {

    if (importSessionRef.current) {

      void cancelImportSession(importSessionRef.current);

      importSessionRef.current = null;

    }

    onClose();

  }



  const reviewComplete = summary ? isReviewComplete(summary, reviewDecisions) : false;

  const primaryBtn = summary

    ? computeButtonLabel(summary, strategy, reviewDecisions, reviewComplete)

    : null;

  const resolvedImportCount = summary

    ? resolveImportCounts(summary, strategy, reviewDecisions).importCount

    : 0;



  return (

    <div

      className="vh-modal-backdrop vh-modal-backdrop--import"

      role="dialog"

      aria-modal="true"

      aria-labelledby="import-wizard-title"

    >

      <div className="vh-modal vh-modal--wide vs-scrollbar">

        <div className="vh-modal__header">

          <h2 id="import-wizard-title">Import passwords</h2>

          <button type="button" className="vault-banner__dismiss" aria-label="Close" onClick={closeWizard}>

            ×

          </button>

        </div>



        {error && !vaultLocked && <div className="vh-banner vh-banner--error">{error}</div>}

        {vaultLocked && step !== "pick" && step !== "report" ? (
          <ImportVaultUnlockPanel
            onUnlocked={() => {
              setVaultLocked(false);
              setError(null);
              void checkVaultUnlocked();
            }}
            onCancel={closeWizard}
          />
        ) : (
          <>
        {step === "pick" && (

          <>

            <p className="muted">Choose a CSV or VaultHarbor JSON export file.</p>

            <input

              ref={fileRef}

              type="file"

              accept=".csv,.json,text/csv,application/json"

              style={{ display: "none" }}

              onChange={(e) => {

                const f = e.target.files?.[0];

                if (f) void processFile(f);

                e.target.value = "";

              }}

            />

            <div className="actions">

              <button type="button" className="btn btn-secondary" onClick={closeWizard}>

                Cancel

              </button>

              <button type="button" className="btn" onClick={() => fileRef.current?.click()}>

                Choose file

              </button>

            </div>

          </>

        )}



        {step === "generic-map" && (

          <form onSubmit={handleGenericMapSubmit}>

            <p className="muted">CSV format not recognized. Map columns to VaultHarbor fields.</p>

            <GenericMapForm headers={csvHeaders} mapping={columnMap} onChange={setColumnMap} />

            <div className="actions">

              <button type="button" className="btn btn-secondary" onClick={closeWizard}>

                Cancel

              </button>

              <button type="submit" className="btn">

                Continue

              </button>

            </div>

          </form>

        )}



        {step === "processing" && (

          <p className="muted">{processingLabel}</p>

        )}



        {step === "summary" && summary && (
          <>
            <ImportItemsTable
              rows={summary.rows}
              subtitle={`${summary.totalFound} items from ${summary.sourceLabel} · ${summary.newCount} new · ${summary.duplicateCount} duplicates · ${summary.invalidCount} invalid${skippedUnsupportedCount > 0 ? ` · ${skippedUnsupportedCount} unsupported` : ""}`}
            />
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={closeWizard}>
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={
                  summary.newCount === 0 &&
                  summary.duplicateCount === 0 &&
                  summary.invalidCount === 0
                }
                onClick={handlePrimaryAction}
              >
                {summary.invalidCount > 0
                  ? `Review ${summary.invalidCount} invalid`
                  : summary.duplicateCount > 0
                    ? "Continue"
                    : primaryBtn?.label ?? "Import"}
              </button>
            </div>
          </>
        )}

        {step === "invalid-review" && summary && (
          <>
            <ImportItemsTable
              rows={summary.rows}
              fixedStatusFilter="invalid"
              title="Fix invalid rows"
              subtitle="Edit each row below, or skip it. Status updates after you save."
            />
            <InvalidReviewList
              rows={getInvalidRows(summary)}
              skips={invalidSkips}
              onSkip={(id) => setInvalidSkips((prev) => ({ ...prev, [id]: true }))}
              onUnskip={(id) =>
                setInvalidSkips((prev) => {
                  const next = { ...prev };
                  delete next[id];
                  return next;
                })
              }
              onSave={handleInvalidSave}
            />
            <div className="actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep("summary")}>
                Back
              </button>
              <button
                type="button"
                className="btn"
                disabled={!isInvalidReviewComplete(summary, invalidSkips)}
                onClick={goAfterInvalidReview}
              >
                {summary.duplicateCount > 0
                  ? "Continue"
                  : `Import ${resolveImportCounts(summary, strategy, reviewDecisions).importCount} items`}
              </button>
            </div>
          </>
        )}

        {step === "duplicate-decision" && summary && (
          <>
            <ImportItemsTable
              rows={summary.rows.filter(
                (r) => r.status === "duplicate_vault" || r.status === "duplicate_intra_file"
              )}
              title="Review duplicates"
              subtitle={duplicateSummaryLine(summary)}
            />
            <p className="muted">What would you like VaultHarbor to do?</p>

            <DuplicateStrategyOptions strategy={strategy} onChange={setStrategy} />

            <div className="actions">

              <button type="button" className="btn btn-secondary" onClick={() => setStep(summary.invalidCount > 0 ? "invalid-review" : "summary")}>

                Back

              </button>

              <button

                type="button"

                className="btn"

                disabled={resolveImportCounts(summary, strategy, reviewDecisions).importCount === 0}

                onClick={handlePrimaryAction}

              >

                {computeButtonLabel(summary, strategy, reviewDecisions, false).label}

              </button>

            </div>

          </>

        )}



        {step === "review" && summary && (
          <>
            <p className="vh-import-review__intro">
              Compare each duplicate and choose which copy to keep. You can reveal passwords
              to compare. Then click <strong>Import</strong> at the bottom.
            </p>
            <p className="vh-import-review__progress">
              {getDuplicateRows(summary).filter((r) => reviewDecisions[r.id] != null).length} of{" "}
              {getDuplicateRows(summary).length} reviewed
            </p>
            <DuplicateReviewList
              rows={getDuplicateRows(summary)}
              allRows={summary.rows}
              vaultById={vaultById}
              decisions={reviewDecisions}
              onDecision={(id, d) =>
                setReviewDecisions((prev) => ({ ...prev, [id]: d }))
              }
            />

            <div className="actions">

              <button type="button" className="btn btn-secondary" onClick={() => setStep("duplicate-decision")}>

                Back

              </button>

              <button

                type="button"

                className="btn"

                disabled={!reviewComplete || resolvedImportCount === 0}

                onClick={() => setStep("confirm")}

              >

                {computeButtonLabel(summary, strategy, reviewDecisions, true).label}

              </button>

            </div>

          </>

        )}



        {step === "confirm" && summary && (

          <>

            <p>

              Import{" "}

              <strong>{resolvedImportCount}</strong>{" "}

              item(s) into your vault?

            </p>

            <p className="muted">Existing vault items will not be modified.</p>

            <div className="actions">

              <button

                type="button"

                className="btn btn-secondary"

                onClick={() =>

                  setStep(summary.duplicateCount > 0 ? "duplicate-decision" : "summary")

                }

              >

                Back

              </button>

              <LoadingButton
                type="button"
                className="btn"
                loading={committing}
                loadingLabel="Importing…"
                disabled={resolvedImportCount === 0 || vaultLocked}
                onClick={() => void handleImportCommit()}
              >

                {primaryBtn?.label ?? "Import"}

              </LoadingButton>

            </div>

          </>

        )}



        {step === "progress" && (
          <>
            <p className="muted">{importProgressLabel}</p>
            <div className="vh-progress">
              <div className="vh-progress__bar" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="muted">{progressPct}%</p>
          </>
        )}

        {step === "report" && report && (
          <>
            <h3>Import complete</h3>
            <ul className="vh-import-report">
              <li>{report.imported} imported</li>
              {report.skipped > 0 && <li>{report.skipped} duplicates skipped</li>}
              {report.invalid > 0 && <li>{report.invalid} invalid rows skipped</li>}
              {report.unsupported > 0 && (
                <li>{report.unsupported} unsupported rows skipped</li>
              )}
            </ul>
            {report.sync.ok ? (
              <p className="vh-banner vh-banner--success">
                Synced to server — your imported items are backed up.
              </p>
            ) : (
              <div className="vh-banner vh-banner--warn">
                <p style={{ margin: "0 0 8px" }}>
                  <strong>Could not sync to server.</strong> Your import is saved on this device.
                </p>
                <p className="muted" style={{ margin: 0 }}>
                  {report.sync.error}
                </p>
              </div>
            )}
            <div className="actions">
              {!report.sync.ok && (
                <LoadingButton
                  type="button"
                  className="btn btn-secondary"
                  loading={syncRetrying}
                  loadingLabel="Syncing…"
                  onClick={() => void handleRetrySyncAfterImport()}
                >
                  Sync now
                </LoadingButton>
              )}
              <button
                type="button"
                className="btn"
                onClick={() => {
                  onDone();
                  closeWizard();
                }}
              >
                Done
              </button>
            </div>
          </>
        )}

          </>
        )}

      </div>

    </div>

  );

}



function DuplicateStrategyOptions({

  strategy,

  onChange,

}: {

  strategy: DuplicateStrategy;

  onChange: (s: DuplicateStrategy) => void;

}) {

  const options: { value: DuplicateStrategy; title: string; desc: string }[] = [

    {

      value: "skip_duplicates",

      title: "Skip duplicates",

      desc: "Keep existing vault items unchanged.",

    },

    {

      value: "import_as_new",

      title: "Import as new items",

      desc: "Keep the existing items and create new copies.",

    },

    {

      value: "review_duplicates",

      title: "Review duplicates",

      desc: "Decide individually which duplicate records to import.",

    },

  ];



  return (

    <div className="vh-import-strategy">

      {options.map((opt) => (

        <label key={opt.value} className="vh-import-strategy__option">

          <input

            type="radio"

            name="dup-strategy"

            checked={strategy === opt.value}

            onChange={() => onChange(opt.value)}

          />

          <span>

            <strong>{opt.title}</strong>

            <span className="muted"> — {opt.desc}</span>

          </span>

        </label>

      ))}

    </div>

  );

}



function DuplicateReviewList({
  rows,
  allRows,
  vaultById,
  decisions,
  onDecision,
}: {
  rows: ImportSummary["rows"];
  allRows: ImportSummary["rows"];
  vaultById: Map<string, VaultItemSummary>;
  decisions: Record<string, ReviewDecision>;
  onDecision: (id: string, d: ReviewDecision) => void;
}) {
  return (
    <div className="vh-import-review vs-scrollbar">
      {rows.map((row) => {
        if (row.status === "duplicate_intra_file") {
          const anchor = allRows.find((r) => r.id === row.anchorRowId);
          return (
            <FileDuplicateCard
              key={row.id}
              row={row}
              anchor={anchor}
              decision={decisions[row.id]}
              onDecision={(d) => onDecision(row.id, d)}
            />
          );
        }

        const existing =
          row.existingVaultId != null ? vaultById.get(row.existingVaultId) : undefined;
        return (
          <VaultDuplicateCard
            key={row.id}
            row={row}
            existing={existing}
            decision={decisions[row.id]}
            onDecision={(d) => onDecision(row.id, d)}
          />
        );
      })}
    </div>
  );
}

function maskSecret(value: string | undefined, revealed: boolean): string {
  if (!value) return "—";
  return revealed ? value : "••••••••";
}

function SecretField({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  const [revealed, setRevealed] = useState(false);
  const hasValue = Boolean(value?.trim());
  return (
    <div className="vh-import-secret">
      <span className="vh-import-secret__label">{label}</span>
      <span className="vh-import-secret__value">
        {hasValue ? maskSecret(value, revealed) : "—"}
      </span>
      {hasValue && (
        <button
          type="button"
          className="vh-import-secret__toggle"
          onClick={() => setRevealed((v) => !v)}
        >
          {revealed ? "Hide" : "Show"}
        </button>
      )}
    </div>
  );
}

function RecordPreviewFields({
  title,
  username,
  website,
  password,
  noteContent,
  isNote,
}: {
  title: string;
  username?: string;
  website?: string;
  password?: string;
  noteContent?: string;
  isNote?: boolean;
}) {
  return (
    <>
      <p>
        <strong>{title || "Untitled"}</strong>
        {!isNote && username ? ` — ${username}` : ""}
      </p>
      {website && <p className="muted">{website}</p>}
      {isNote ? (
        <SecretField label="Content" value={noteContent} />
      ) : (
        <SecretField label="Password" value={password} />
      )}
    </>
  );
}

function FileDuplicateCard({
  row,
  anchor,
  decision,
  onDecision,
}: {
  row: ImportSummary["rows"][0];
  anchor: ImportSummary["rows"][0] | undefined;
  decision: ReviewDecision | undefined;
  onDecision: (d: ReviewDecision) => void;
}) {
  const decided = decision != null;
  const anchorIndex = anchor?.record.rowIndex ?? "?";
  return (
    <div className={`vh-import-review__item${decided ? " is-decided" : ""}`}>
      <div className="vh-import-review__header">
        <p className="muted" style={{ margin: 0 }}>
          Choose one — row {anchorIndex} vs row {row.record.rowIndex}
        </p>
        <span className="vh-import-dup-badge vh-import-dup-badge--file">In this file</span>
      </div>
      <p className="vh-import-review__detail muted">
        Same website/username (or title) appears twice in the import file. Pick which copy to
        keep — the other will be skipped.
      </p>
      <div className="vh-import-review__compare">
        <div
          className={`vh-import-review__side${
            decision === "keep_anchor" ? " is-picked" : ""
          }`}
        >
          <p className="vh-import-review__side-label muted">
            Row {anchorIndex} (first in file)
          </p>
          {anchor ? (
            <RecordPreviewFields
              title={anchor.preview.title}
              username={anchor.preview.username}
              website={anchor.preview.website}
              password={anchor.record.password}
              noteContent={anchor.record.secureNoteContent}
              isNote={anchor.preview.type === "secure_note"}
            />
          ) : (
            <p className="muted">Earlier row not found.</p>
          )}
        </div>
        <div
          className={`vh-import-review__side${
            decision === "keep_this" ? " is-picked" : ""
          }`}
        >
          <p className="vh-import-review__side-label muted">
            Row {row.record.rowIndex} (this duplicate)
          </p>
          <RecordPreviewFields
            title={row.preview.title}
            username={row.preview.username}
            website={row.preview.website}
            password={row.record.password}
            noteContent={row.record.secureNoteContent}
            isNote={row.preview.type === "secure_note"}
          />
        </div>
      </div>
      <div className="vh-import-review__choices" role="group" aria-label="Choose which row to keep">
        <button
          type="button"
          className={`vh-import-choice vh-import-choice--import${
            decision === "keep_anchor" ? " is-selected" : ""
          }`}
          aria-pressed={decision === "keep_anchor"}
          onClick={() => onDecision("keep_anchor")}
        >
          Keep row {anchorIndex}
        </button>
        <button
          type="button"
          className={`vh-import-choice vh-import-choice--import${
            decision === "keep_this" ? " is-selected" : ""
          }`}
          aria-pressed={decision === "keep_this"}
          onClick={() => onDecision("keep_this")}
        >
          Keep row {row.record.rowIndex}
        </button>
        <button
          type="button"
          className={`vh-import-choice${decision === "skip" ? " is-selected" : ""}`}
          aria-pressed={decision === "skip"}
          onClick={() => onDecision("skip")}
          title="Skip this duplicate only; the first row stays as new"
        >
          Skip this duplicate
        </button>
      </div>
    </div>
  );
}

function VaultDuplicateCard({
  row,
  existing,
  decision,
  onDecision,
}: {
  row: ImportSummary["rows"][0];
  existing: VaultItemSummary | undefined;
  decision: ReviewDecision | undefined;
  onDecision: (d: ReviewDecision) => void;
}) {
  const decided = decision != null;
  const [vaultPassword, setVaultPassword] = useState<string | null>(null);
  const [vaultNote, setVaultNote] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [secretError, setSecretError] = useState<string | null>(null);

  async function loadVaultSecret() {
    if (!row.existingVaultId || vaultPassword != null || vaultNote != null) return;
    setLoadingSecret(true);
    setSecretError(null);
    const res = await bg<{
      type: string;
      password?: string;
      content?: string;
    }>({ type: "GET_VAULT_ITEM", id: row.existingVaultId });
    setLoadingSecret(false);
    if (!res.ok || !res.data) {
      setSecretError(res.error ?? "Could not load vault item.");
      return;
    }
    if (res.data.type === "secure_note") {
      setVaultNote(res.data.content ?? "");
    } else {
      setVaultPassword(res.data.password ?? "");
    }
  }

  return (
    <div className={`vh-import-review__item${decided ? " is-decided" : ""}`}>
      <div className="vh-import-review__header">
        <p className="muted" style={{ margin: 0 }}>
          Row {row.record.rowIndex}
        </p>
        <span className="vh-import-dup-badge vh-import-dup-badge--vault">In your vault</span>
      </div>
      <p className="vh-import-review__detail muted">
        Matches an item already saved in VaultHarbor. Compare passwords, then skip or import a
        second copy.
      </p>
      <div className="vh-import-review__compare">
        <div className="vh-import-review__side">
          <p className="vh-import-review__side-label muted">In your vault</p>
          {existing ? (
            <>
              <p>
                <strong>{existing.name}</strong>
                {existing.type === "login" && existing.subtitle
                  ? ` — ${existing.subtitle}`
                  : ""}
              </p>
              {existing.uri && <p className="muted">{existing.uri}</p>}
              {vaultPassword == null && vaultNote == null ? (
                <button
                  type="button"
                  className="vh-import-secret__toggle"
                  disabled={loadingSecret}
                  onClick={() => void loadVaultSecret()}
                >
                  {loadingSecret ? "Loading…" : "Show vault password"}
                </button>
              ) : existing.type === "secure_note" ? (
                <SecretField label="Content" value={vaultNote ?? undefined} />
              ) : (
                <SecretField label="Password" value={vaultPassword ?? undefined} />
              )}
              {secretError && <p className="error">{secretError}</p>}
            </>
          ) : (
            <p className="muted">Existing item unavailable.</p>
          )}
        </div>
        <div className="vh-import-review__side">
          <p className="vh-import-review__side-label muted">From import file</p>
          <RecordPreviewFields
            title={row.preview.title}
            username={row.preview.username}
            website={row.preview.website}
            password={row.record.password}
            noteContent={row.record.secureNoteContent}
            isNote={row.preview.type === "secure_note"}
          />
        </div>
      </div>
      <div className="vh-import-review__choices" role="group" aria-label="Duplicate action">
        <button
          type="button"
          className={`vh-import-choice${decision === "skip" ? " is-selected" : ""}`}
          aria-pressed={decision === "skip"}
          onClick={() => onDecision("skip")}
        >
          Keep vault (skip)
        </button>
        <button
          type="button"
          className={`vh-import-choice vh-import-choice--import${
            decision === "import_as_new" ? " is-selected" : ""
          }`}
          aria-pressed={decision === "import_as_new"}
          onClick={() => onDecision("import_as_new")}
        >
          Import as new
        </button>
      </div>
    </div>
  );
}



const MAP_FIELDS: { key: keyof GenericColumnMapping; label: string }[] = [

  { key: "title", label: "Title" },

  { key: "website", label: "Website" },

  { key: "username", label: "Username" },

  { key: "password", label: "Password" },

  { key: "loginNotes", label: "Notes (login)" },

  { key: "secureNoteContent", label: "Content (secure note)" },

  { key: "folder", label: "Folder" },

  { key: "type", label: "Type" },

];



function GenericMapForm({

  headers,

  mapping,

  onChange,

}: {

  headers: string[];

  mapping: GenericColumnMapping;

  onChange: (m: GenericColumnMapping) => void;

}) {

  return (

    <div className="vh-import-map">

      {MAP_FIELDS.map(({ key, label }) => (

        <label key={key} className="field">

          <span>{label}</span>

          <select

            value={mapping[key] ?? ""}

            onChange={(e) =>

              onChange({ ...mapping, [key]: e.target.value || undefined })

            }

          >

            <option value="">—</option>

            {headers.map((h) => (

              <option key={h} value={h}>

                {h}

              </option>

            ))}

          </select>

        </label>

      ))}

    </div>

  );

}


