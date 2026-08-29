import { apiRequest } from "./client";
import type {
  AuthTokensResponse,
  LoginRequest,
  LogoutRequest,
  RegisterRequest,
  UserResponse,
} from "../types/api";

export async function register(
  payload: RegisterRequest,
  accessToken?: null
): Promise<{ user: UserResponse }> {
  const { data } = await apiRequest<{ user: UserResponse }>(
    "/api/v1/auth/register",
    { method: "POST", body: payload, accessToken, skipAuth: true }
  );
  return data;
}

export async function login(
  payload: LoginRequest,
  accessToken?: null
): Promise<AuthTokensResponse> {
  const { data } = await apiRequest<AuthTokensResponse>(
    "/api/v1/auth/login",
    { method: "POST", body: payload, accessToken, skipAuth: true }
  );
  return data;
}

export async function refresh(refreshToken: string): Promise<AuthTokensResponse> {
  const { data } = await apiRequest<AuthTokensResponse>(
    "/api/v1/auth/refresh",
    {
      method: "POST",
      body: { refresh_token: refreshToken },
      skipAuth: true,
    }
  );
  return data;
}

export async function logout(
  accessToken: string,
  payload: LogoutRequest = {}
): Promise<void> {
  await apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    body: payload,
    accessToken,
  });
}

export async function me(accessToken: string): Promise<{ user: UserResponse }> {
  const { data } = await apiRequest<{ user: UserResponse }>(
    "/api/v1/auth/me",
    { accessToken }
  );
  return data;
}

export function createDefaultKdf(): RegisterRequest["kdf"] {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  let salt = "";
  for (const b of saltBytes) {
    salt += String.fromCharCode(b);
  }
  return {
    algorithm: "pbkdf2-sha256",
    iterations: 600_000,
    memory_kib: null,
    parallelism: null,
    salt: btoa(salt),
  };
}

export async function forgotPassword(
  email: string
): Promise<{ message: string }> {
  const { data } = await apiRequest<{ message: string }>(
    "/api/v1/auth/forgot-password",
    { method: "POST", body: { email }, skipAuth: true }
  );
  return data;
}

export async function resetPassword(
  payload: import("../types/api").ResetPasswordRequest
): Promise<void> {
  await apiRequest<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: payload,
    skipAuth: true,
  });
}
