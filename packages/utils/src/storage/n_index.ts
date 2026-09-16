/** safe wrapper around localStorage/sessionStorage — handles SSR, JSON, and quota errors gracefully */
class SafeStorage {
  constructor(private storage: Storage | undefined) {}

  get<T>(key: string, fallback?: T): T | undefined {
    if (!this.storage) return fallback;
    try {
      const item = this.storage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.storage) return false;
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false; // quota exceeded, private mode, etc.
    }
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
  }

  clear(): void {
    this.storage?.clear();
  }

  has(key: string): boolean {
    return this.storage ? this.storage.getItem(key) !== null : false;
  }
}

export const localStore = new SafeStorage(typeof window !== "undefined" ? window.localStorage : undefined);
export const sessionStore = new SafeStorage(typeof window !== "undefined" ? window.sessionStorage : undefined);

/** non-httpOnly cookie helpers — fine for UI prefs; auth tokens should stay in real httpOnly cookies */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 7, options: { path?: string; sameSite?: "Lax" | "Strict" | "None"; secure?: boolean } = {}): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86_400_000).toUTCString();
  const { path = "/", sameSite = "Lax", secure = true } = options;
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

export function removeCookie(name: string, path = "/"): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}