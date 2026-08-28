/** Promise-normalizing shim for chrome.* APIs. */

type ChromeApi = typeof chrome;

function promisify<T>(
  fn: (callback: (result: T) => void) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      fn((result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export const browser: ChromeApi = chrome;

export async function storageLocalGet<T extends Record<string, unknown>>(
  keys: string | string[] | null
): Promise<T> {
  return promisify((cb) => chrome.storage.local.get(keys, cb)) as Promise<T>;
}

export async function storageLocalSet(items: Record<string, unknown>): Promise<void> {
  await promisify<void>((cb) => chrome.storage.local.set(items, cb));
}

export async function storageLocalRemove(keys: string | string[]): Promise<void> {
  await promisify<void>((cb) => chrome.storage.local.remove(keys, cb));
}

export async function storageSessionGet<T extends Record<string, unknown>>(
  keys: string | string[] | null
): Promise<T> {
  return promisify((cb) => chrome.storage.session.get(keys, cb)) as Promise<T>;
}

export async function storageSessionSet(items: Record<string, unknown>): Promise<void> {
  await promisify<void>((cb) => chrome.storage.session.set(items, cb));
}

export async function storageSessionRemove(keys: string | string[]): Promise<void> {
  await promisify<void>((cb) => chrome.storage.session.remove(keys, cb));
}

export async function createAlarm(
  name: string,
  alarmInfo: chrome.alarms.AlarmCreateInfo
): Promise<void> {
  await promisify<void>((cb) => chrome.alarms.create(name, alarmInfo, cb));
}

export async function clearAlarm(name: string): Promise<boolean> {
  return promisify<boolean>((cb) => chrome.alarms.clear(name, cb));
}

export function sendMessage<T>(message: unknown): Promise<T> {
  return promisify((cb) => chrome.runtime.sendMessage(message, cb)) as Promise<T>;
}

export async function queryTabs(
  query: chrome.tabs.QueryInfo
): Promise<chrome.tabs.Tab[]> {
  return promisify((cb) => chrome.tabs.query(query, cb));
}

export async function getActiveTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await queryTabs({ active: true, currentWindow: true });
  return tabs[0];
}
