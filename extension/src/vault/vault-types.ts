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

export type SecureNoteItem = BaseVaultItem & {
  type: "secure_note";
  content: string;
};

export type VaultItem = LoginItem | SecureNoteItem | (BaseVaultItem & Record<string, unknown>);

export type NewLoginItem = {
  name: string;
  username: string;
  password: string;
  uri: string;
  notes?: string;
};

export type NewSecureNoteItem = {
  name: string;
  content: string;
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
  recovery_wrapped_vault_key?: string | null;
  recovery_salt?: string | null;
  recovery_kdf_algorithm?: string | null;
  recovery_kdf_iterations?: number | null;
};

export type VaultListFilter = "all" | "login" | "secure_note" | "trash" | "other";
export type VaultListSort = "name" | "updated";

export type ListVaultItemsOptions = {
  query?: string;
  filter?: VaultListFilter;
  sort?: VaultListSort;
};

export function isLoginItem(item: VaultItem): item is LoginItem {
  return item.type === "login" && !item.deleted_at;
}

export function isSecureNoteItem(item: VaultItem): item is SecureNoteItem {
  return item.type === "secure_note" && !item.deleted_at;
}

export function isActiveItem(item: VaultItem): boolean {
  return !item.deleted_at;
}
