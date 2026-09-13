import "fake-indexeddb/auto";

const storage: Record<string, Record<string, unknown>> = {
  local: {},
  session: {},
};

(globalThis as typeof globalThis & { chrome: typeof chrome }).chrome = {
  storage: {
    local: {
      get: (keys: string | string[] | null, cb: (r: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {};
        const list = keys === null ? Object.keys(storage.local) : Array.isArray(keys) ? keys : [keys];
        for (const k of list) {
          if (k in storage.local) result[k] = storage.local[k];
        }
        cb(result);
      },
      set: (items: Record<string, unknown>, cb: () => void) => {
        Object.assign(storage.local, items);
        cb();
      },
      remove: (keys: string | string[], cb: () => void) => {
        const list = Array.isArray(keys) ? keys : [keys];
        for (const k of list) delete storage.local[k];
        cb();
      },
    },
    session: {
      get: (keys: string | string[] | null, cb: (r: Record<string, unknown>) => void) => {
        const result: Record<string, unknown> = {};
        const list = keys === null ? Object.keys(storage.session) : Array.isArray(keys) ? keys : [keys];
        for (const k of list) {
          if (k in storage.session) result[k] = storage.session[k];
        }
        cb(result);
      },
      set: (items: Record<string, unknown>, cb: () => void) => {
        Object.assign(storage.session, items);
        cb();
      },
      remove: (keys: string | string[], cb: () => void) => {
        const list = Array.isArray(keys) ? keys : [keys];
        for (const k of list) delete storage.session[k];
        cb();
      },
    },
  },
  runtime: {
    lastError: undefined,
    getURL: (path: string) => `chrome-extension://test/${path}`,
    getManifest: () => ({ version: "0.1.1" }),
    sendMessage: async () => undefined,
    onMessage: { addListener: () => {}, removeListener: () => {} },
  },
  action: {
    setTitle: async () => undefined,
    openPopup: async () => undefined,
  },
  windows: {
    create: async () => ({}),
  },
  tabs: {
    query: async () => [],
    sendMessage: async () => undefined,
    create: async () => ({}),
  },
} as unknown as typeof chrome;

export function resetChromeStorage(): void {
  storage.local = {};
  storage.session = {};
}
