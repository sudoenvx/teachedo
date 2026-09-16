/** Typed wrapper around localStorage/sessionStorage with JSON handling and SSR safety. */
export class TypedStorage {
  constructor(private storage: Storage | undefined) {}

  get<T>(key: string, fallback: T | null = null): T | null {
    if (!this.storage) return fallback;
    try {
      const raw = this.storage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    this.storage?.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
  }

  /** Removes every key belonging to a tenant (pair with tenantScopedKey from ./tenant). */
  clearTenant(tenantId: string): void {
    if (!this.storage) return;
    const prefix = `t:${tenantId}:`;
    Object.keys(this.storage)
      .filter((k) => k.startsWith(prefix))
      .forEach((k) => this.storage!.removeItem(k));
  }
}

export const localStorageClient = new TypedStorage(typeof window !== "undefined" ? window.localStorage : undefined);
export const sessionStorageClient = new TypedStorage(typeof window !== "undefined" ? window.sessionStorage : undefined);