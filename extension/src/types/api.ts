export type KdfDescriptor = {
  algorithm: "pbkdf2-sha256" | "argon2id";
  iterations: number;
  memory_kib: number | null;
  parallelism: number | null;
  salt: string;
};

export type UserResponse = {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
  kdf: KdfDescriptor;
};

export type AuthTokensResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
};

export type RegisterRequest = {
  email: string;
  password: string;
  kdf?: KdfDescriptor;
};

export type LoginRequest = {
  email: string;
  password: string;
  device_id?: string;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type LogoutRequest = {
  refresh_token?: string;
  all_devices?: boolean;
};

export type DeviceRegisterRequest = {
  device_name: string;
  device_type: "browser" | "desktop" | "mobile" | "other";
  device_identifier: string;
};

export type DeviceResponse = {
  id: string;
  device_name: string;
  device_type: string;
  device_identifier: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type VaultResponse = {
  encrypted_vault: string;
  wrapped_vault_key: string | null;
  vault_version: number;
  revision: number;
  recovery_wrapped_vault_key?: string | null;
  recovery_salt?: string | null;
  recovery_kdf_algorithm?: string | null;
  recovery_kdf_iterations?: number | null;
};

export type VaultPutRequest = {
  encrypted_vault: string;
  wrapped_vault_key: string;
  vault_version: number;
  base_revision: number;
  client_mutation_id: string;
  device_id?: string;
  recovery_wrapped_vault_key?: string;
  recovery_salt?: string;
  recovery_kdf_algorithm?: string;
  recovery_kdf_iterations?: number;
};

export type VaultDeleteRequest = {
  password: string;
  confirm: "DELETE";
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  email: string;
  code: string;
  new_password: string;
};

export type SyncChange = {
  revision: number;
  operation: string;
  device_id: string | null;
  created_at: string;
};

export type SyncResponse = {
  current_revision: number;
  vault_version: number | null;
  changes: SyncChange[];
  has_more: boolean;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  request_id?: string;
};
