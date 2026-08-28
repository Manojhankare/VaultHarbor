/** In-memory caches only — never authoritative. Rehydrate from storage on every entry. */

export type RuntimeCaches = {
  dekLoaded: boolean;
};

export const runtimeCaches: RuntimeCaches = {
  dekLoaded: false,
};

export function resetRuntimeCaches(): void {
  runtimeCaches.dekLoaded = false;
}
