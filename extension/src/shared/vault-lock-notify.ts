type VaultLockedListener = () => void;

const listeners = new Set<VaultLockedListener>();

/** Subscribe to background auto-lock or explicit lock while UI still shows unlocked. */
export function onVaultLocked(listener: VaultLockedListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyVaultLocked(): void {
  for (const listener of listeners) {
    listener();
  }
}
