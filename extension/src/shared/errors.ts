export type ExtensionErrorCode =
  | "AUTH_REQUIRED"
  | "VAULT_LOCKED"
  | "VAULT_DECRYPT_FAILED"
  | "SYNC_CONFLICT"
  | "NETWORK_ERROR"
  | "INVALID_ORIGIN"
  | "CREDENTIAL_NOT_FOUND"
  | "API_ERROR"
  | "VALIDATION_ERROR"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMIT"
  | "OFFLINE"
  | "MASTER_PASSWORD_CHANGED"
  | "RECOVERY_KEY_INVALID"
  | "RESET_CODE_INVALID"
  | "RESET_CODE_EXPIRED";

export class ExtensionError extends Error {
  readonly code: ExtensionErrorCode;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ExtensionErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ExtensionError";
    this.code = code;
    this.details = details;
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function isExtensionError(err: unknown): err is ExtensionError {
  return err instanceof ExtensionError;
}

export function userFacingMessage(err: unknown): string {
  if (isExtensionError(err)) {
    return err.message;
  }
  if (isApiError(err)) {
    switch (err.code) {
      case "INVALID_CREDENTIALS":
        return "Invalid email or password.";
      case "VAULT_REVISION_CONFLICT":
        return "Vault was changed on another device.";
      case "VAULT_NOT_FOUND":
        return "No vault found yet.";
      case "ACCESS_TOKEN_EXPIRED":
        return "Session expired. Please sign in again.";
      case "ACCOUNT_LOCKED":
        return "Account temporarily locked. Try again later.";
      case "RATE_LIMIT_EXCEEDED":
        return "Too many requests. Please wait.";
      case "PAYLOAD_TOO_LARGE":
        return "Vault is too large to sync.";
      case "RESET_CODE_INVALID":
        return "Invalid reset code.";
      case "RESET_CODE_EXPIRED":
        return "Reset code has expired. Request a new one.";
      default:
        return err.message || "Something went wrong.";
    }
  }
  if (err instanceof TypeError && err.message.includes("fetch")) {
    return "Unable to connect. Check your network.";
  }
  return "An unexpected error occurred.";
}
