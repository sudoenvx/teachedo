export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => search.append(key, String(v)));
    } else {
      search.append(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

export function parseQueryString<T = Record<string, string>>(query: string): T {
  const params = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
  const out: Record<string, string> = {};
  params.forEach((value, key) => {
    out[key] = value;
  });
  return out as T;
}

export function joinPaths(...segments: string[]): string {
  return segments
    .map((s, i) => (i === 0 ? s.replace(/\/+$/, "") : s.replace(/^\/+|\/+$/g, "")))
    .filter(Boolean)
    .join("/");
}

export function getDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function isExternalUrl(url: string, currentHost = typeof window !== "undefined" ? window.location.hostname : ""): boolean {
  const domain = getDomain(url);
  return !!domain && domain !== currentHost;
}