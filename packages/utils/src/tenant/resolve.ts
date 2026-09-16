/**
 * Resolves a tenant identifier from a hostname.
 * Handles both subdomain (acme.yourlms.com) and custom domain (learn.acme.com) setups.
 */
export interface ResolveTenantOptions {
  /** your platform's root domain, e.g. "yourlms.com" */
  rootDomain: string;
  /** hosts that should never be treated as a tenant subdomain (app, www, api, admin...) */
  reservedSubdomains?: string[];
}

export type TenantResolution =
  | { type: "subdomain"; identifier: string }
  | { type: "custom-domain"; identifier: string }
  | { type: "none" };

export function resolveTenantFromHost(
  host: string,
  { rootDomain, reservedSubdomains = ["www", "app", "api", "admin"] }: ResolveTenantOptions
): TenantResolution {
  const cleanHost = host.split(":")[0].toLowerCase();

  if (cleanHost.endsWith(`.${rootDomain}`)) {
    const subdomain = cleanHost.replace(`.${rootDomain}`, "");
    if (!subdomain || reservedSubdomains.includes(subdomain)) return { type: "none" };
    return { type: "subdomain", identifier: subdomain };
  }

  if (cleanHost !== rootDomain && cleanHost !== `www.${rootDomain}`) {
    return { type: "custom-domain", identifier: cleanHost };
  }

  return { type: "none" };
}

/** Pulls tenant slug out of a path-based scheme instead, e.g. /t/acme/courses */
export function resolveTenantFromPath(pathname: string, prefix = "/t/"): string | null {
  if (!pathname.startsWith(prefix)) return null;
  const rest = pathname.slice(prefix.length);
  return rest.split("/")[0] || null;
}