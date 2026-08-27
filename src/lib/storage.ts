/**
 * Storage adapter layer.
 *
 * Every read/write to persistent storage goes through this interface.
 * The rest of the app (see repository.ts) never touches `localStorage`
 * directly, so swapping this for Supabase/Postgres/Firebase later only
 * means writing a new adapter that satisfies `StorageAdapter`.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const STORAGE_UNAVAILABLE_WARNING =
  "[finance-app] localStorage is not available; data will not persist.";

class LocalStorageAdapter implements StorageAdapter {
  private available: boolean;

  constructor() {
    this.available = LocalStorageAdapter.detect();
  }

  private static detect(): boolean {
    try {
      const testKey = "__storage_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string): T | null {
    if (!this.available) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.error(`[finance-app] Failed to read "${key}" from storage`, err);
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.available) {
      console.warn(STORAGE_UNAVAILABLE_WARNING);
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[finance-app] Failed to write "${key}" to storage`, err);
    }
  }

  remove(key: string): void {
    if (!this.available) return;
    try {
      window.localStorage.removeItem(key);
    } catch (err) {
      console.error(`[finance-app] Failed to remove "${key}" from storage`, err);
    }
  }
}

export const storage: StorageAdapter = new LocalStorageAdapter();
