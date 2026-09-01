export type ExportFormat = "vaultharbor-csv" | "vaultharbor-json";

export type { ExportScope } from "../vault/vault-types";

export type ExportOptions = {
  format: ExportFormat;
  scope: import("../vault/vault-types").ExportScope;
};
