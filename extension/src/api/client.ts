import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "../shared/constants";
import { ApiError } from "../shared/errors";
import type { ApiErrorBody } from "../types/api";

export type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  accessToken?: string | null;
  skipAuth?: boolean;
  ifNoneMatch?: string;
};

let refreshPromise: Promise<string | null> | null = null;
let getRefreshToken: (() => Promise<string | null>) | null = null;
let onTokensRefreshed: ((access: string, refresh: string, expiresIn: number) => Promise<void>) | null = null;
let onAuthFailure: (() => Promise<void>) | null = null;

export function configureAuthHandlers(handlers: {
  getRefreshToken: () => Promise<string | null>;
  onTokensRefreshed: (access: string, refresh: string, expiresIn: number) => Promise<void>;
  onAuthFailure: () => Promise<void>;
}): void {
  getRefreshToken = handlers.getRefreshToken;
  onTokensRefreshed = handlers.onTokensRefreshed;
  onAuthFailure = handlers.onAuthFailure;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    // ignore
  }
  const code = body?.error?.code ?? "API_ERROR";
  const message = body?.error?.message ?? response.statusText;
  const details = body?.error?.details;
  const requestId = body?.request_id;
  return new ApiError(response.status, code, message, details, requestId);
}

async function refreshAccessToken(): Promise<string | null> {
  if (!getRefreshToken || !onTokensRefreshed) {
    return null;
  }
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshToken = await getRefreshToken!();
        if (!refreshToken) {
          await onAuthFailure!();
          return null;
        }
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!response.ok) {
          await onAuthFailure!();
          return null;
        }
        const data = (await response.json()) as {
          access_token: string;
          refresh_token: string;
          expires_in: number;
        };
        await onTokensRefreshed!(
          data.access_token,
          data.refresh_token,
          data.expires_in
        );
        return data.access_token;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<{ data: T; etag?: string; status: number }> {
  const {
    method = "GET",
    body,
    headers = {},
    accessToken,
    skipAuth = false,
    ifNoneMatch,
  } = options;

  const url = `${API_BASE_URL}${path}`;
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }
  if (ifNoneMatch) {
    requestHeaders["If-None-Match"] = ifNoneMatch;
  }
  if (accessToken && !skipAuth) {
    requestHeaders["Authorization"] = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    let response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (
      response.status === 401 &&
      !skipAuth &&
      accessToken &&
      onTokensRefreshed
    ) {
      const err = await parseErrorResponse(response.clone());
      if (err.code === "ACCESS_TOKEN_EXPIRED") {
        const newToken = await refreshAccessToken();
        if (newToken) {
          requestHeaders["Authorization"] = `Bearer ${newToken}`;
          response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal,
          });
        }
      } else if (
        err.code === "ACCESS_TOKEN_INVALID" ||
        err.code === "REFRESH_TOKEN_INVALID" ||
        err.code === "REFRESH_TOKEN_REUSED"
      ) {
        await onAuthFailure?.();
        throw err;
      }
    }

    if (response.status === 304) {
      return { data: undefined as T, etag: response.headers.get("ETag") ?? undefined, status: 304 };
    }

    if (!response.ok) {
      throw await parseErrorResponse(response);
    }

    if (response.status === 204) {
      return { data: undefined as T, status: 204 };
    }

    const data = (await response.json()) as T;
    return {
      data,
      etag: response.headers.get("ETag") ?? undefined,
      status: response.status,
    };
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(0, "NETWORK_ERROR", "Request timed out.");
    }
    throw new ApiError(0, "NETWORK_ERROR", "Network request failed.");
  } finally {
    clearTimeout(timeout);
  }
}
