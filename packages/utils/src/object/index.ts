export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) if (key in obj) out[key] = obj[key];
  return out;
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const out = { ...obj };
  for (const key of keys) delete out[key];
  return out;
}

export function isEmptyObject(obj: object): boolean {
  return Object.keys(obj).length === 0;
}

export function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;

  const keysA = Object.keys(a as object);
  const keysB = Object.keys(b as object);
  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  );
}

export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (isPlainObject(sourceVal) && isPlainObject(targetVal)) {
      output[key] = deepMerge(targetVal as object, sourceVal as object) as T[keyof T];
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal as T[keyof T];
    }
  }
  return output;
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && value.constructor === Object;
}

/** removes keys whose value is undefined/null (useful for query params, patch payloads) */
export function compact<T extends object>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

export function getPath<T = unknown>(obj: unknown, path: string, fallback?: T): T {
  const result = path
    .split(".")
    .reduce<unknown>((acc, key) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[key] : undefined), obj);
  return (result ?? fallback) as T;
}

export function setPath<T extends object>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone = deepClone(obj);
  let cursor: Record<string, unknown> = clone as Record<string, unknown>;
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      cursor[key] = value;
    } else {
      cursor[key] = isPlainObject(cursor[key]) ? cursor[key] : {};
      cursor = cursor[key] as Record<string, unknown>;
    }
  });
  return clone;
}

export function invert<K extends PropertyKey, V extends PropertyKey>(obj: Record<K, V>): Record<V, K> {
  const out = {} as Record<V, K>;
  for (const key in obj) out[obj[key]] = key;
  return out;
}