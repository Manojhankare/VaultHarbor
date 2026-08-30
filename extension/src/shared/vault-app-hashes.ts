export const VAULT_HASH = {
  FORGOT: "#forgot",
  CONNECTION: "#connection",
  REGISTER: "#register",
  RECOVER_MASTER: "#recover-master",
  RESET_VAULT: "#reset-vault",
  SETUP_MASTER: "#setup-master",
} as const;

export type VaultUnlockView = "unlock" | "recover" | "reset";

export function unlockViewFromHash(hash: string): VaultUnlockView {
  if (hash === VAULT_HASH.RECOVER_MASTER) return "recover";
  if (hash === VAULT_HASH.RESET_VAULT) return "reset";
  return "unlock";
}

export function setVaultAppHash(hash: string): void {
  const normalized = hash.startsWith("#") ? hash : `#${hash}`;
  if (window.location.hash === normalized) return;
  window.location.hash = normalized;
}
