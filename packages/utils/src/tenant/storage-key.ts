/**
 * Namespaces any storage/cache key by tenant so data never leaks across tenants
 * on a shared browser (e.g. localStorage, query cache keys, IndexedDB).
 */
export function tenantScopedKey(tenantId: string, key: string): string {
  return `t:${tenantId}:${key}`;
}

export function tenantScopedQueryKey(tenantId: string, key: readonly unknown[]): unknown[] {
  return [`tenant:${tenantId}`, ...key];
}