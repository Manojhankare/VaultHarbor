import type { CredentialSummary } from "./messages";

export type AutofillPrompt = "none" | "locked" | "signed_out" | "needs_setup";

export type MatchingCredentialsPayload = {
  prompt: AutofillPrompt;
  vaultLocked: boolean;
  items: CredentialSummary[];
};

const PROMPTS = new Set<AutofillPrompt>([
  "none",
  "locked",
  "signed_out",
  "needs_setup",
]);

export function isBlockingAutofillPrompt(prompt: AutofillPrompt): boolean {
  return prompt === "locked" || prompt === "signed_out" || prompt === "needs_setup";
}

export function matchingCredentialsPayload(
  items: CredentialSummary[] = [],
  prompt: AutofillPrompt = "none"
): MatchingCredentialsPayload {
  const blocking = isBlockingAutofillPrompt(prompt);
  return {
    prompt,
    vaultLocked: prompt === "locked",
    items: blocking ? [] : items,
  };
}

function readPrompt(value: unknown): AutofillPrompt | null {
  return typeof value === "string" && PROMPTS.has(value as AutofillPrompt)
    ? (value as AutofillPrompt)
    : null;
}

/** Accept the structured payload, a legacy array, or a VAULT_LOCKED error. */
export function parseMatchingCredentials(response: {
  ok?: boolean;
  code?: string;
  data?: unknown;
} | null): MatchingCredentialsPayload {
  if (!response) {
    return matchingCredentialsPayload();
  }
  if (!response.ok) {
    if (response.code === "VAULT_LOCKED") {
      return matchingCredentialsPayload([], "locked");
    }
    if (response.code === "AUTH_REQUIRED") {
      return matchingCredentialsPayload([], "signed_out");
    }
    return matchingCredentialsPayload();
  }
  const data = response.data;
  if (Array.isArray(data)) {
    return matchingCredentialsPayload(data as CredentialSummary[], "none");
  }
  if (data && typeof data === "object") {
    const payload = data as Partial<MatchingCredentialsPayload>;
    const prompt =
      readPrompt(payload.prompt) ??
      (payload.vaultLocked ? "locked" : "none");
    return matchingCredentialsPayload(
      Array.isArray(payload.items) ? payload.items : [],
      prompt
    );
  }
  return matchingCredentialsPayload();
}

export function autofillIconLabel(prompt: AutofillPrompt): string {
  switch (prompt) {
    case "locked":
      return "VaultHarbor is locked — click to unlock";
    case "signed_out":
      return "Sign in to VaultHarbor to autofill";
    case "needs_setup":
      return "Set up VaultHarbor to autofill";
    default:
      return "VaultHarbor autofill";
  }
}

export function autofillFrameTitle(prompt: AutofillPrompt): string {
  switch (prompt) {
    case "locked":
      return "VaultHarbor is locked";
    case "signed_out":
      return "Sign in to VaultHarbor";
    case "needs_setup":
      return "Set up VaultHarbor";
    default:
      return "VaultHarbor autofill";
  }
}
