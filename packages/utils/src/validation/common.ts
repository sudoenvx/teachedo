const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

/** Loose international phone check — for real validation use a proper phone lib per-country. */
export function isValidPhone(value: string): boolean {
  return /^\+?[0-9\s\-().]{7,20}$/.test(value.trim());
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/** Tenant subdomain: lowercase letters, numbers, hyphens, 3-63 chars, no leading/trailing hyphen. */
export function isValidSubdomain(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(value);
}