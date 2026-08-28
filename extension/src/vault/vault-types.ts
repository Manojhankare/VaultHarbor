export type VaultItemType =
  | "login"
  | "secure_note"
  | "api_credential"
  | "database_credential"
  | "server_credential"
  | "ssh_key"
  | "card";

export type BaseVaultItem = {
  id: string;
  type: VaultItemType;
  name: string;
  notes?: string;
  custom_fields?: Record<string, string>;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type LoginItem = BaseVaultItem & {
  type: "login";
  username: string;
  password: string;
  uri: string;
};

export type VaultItem = LoginItem | (BaseVaultItem & Record<string, unknown>);

export type NewLoginItem = {
  name: string;
  username: string;
  password: string;
  uri: string;
  notes?: string;
};

export type VaultDocument = {
  version: number;
  items: VaultItem[];
};

export type EncryptedVaultMeta = {
  encrypted_vault: string;
  wrapped_vault_key: string;
  vault_version: number;
  revision: number;
  etag?: string;
  updated_at: string;
};

export function isLoginItem(item: VaultItem): item is LoginItem {
  return item.type === "login" && !item.deleted_at;
}

export function isActiveItem(item: VaultItem): boolean {
  return !item.deleted_at;
}
