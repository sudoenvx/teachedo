export function capitalize(str: string): string {
  if (!str) return str;
  return str[0].toUpperCase() + str.slice(1);
}

export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (w) => capitalize(w.toLowerCase()));
}

export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

export function snakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}

export function kebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
}

export function pascalCase(str: string): string {
  return capitalize(camelCase(str));
}

export function truncate(str: string, maxLength: number, suffix = "…"): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length).trimEnd() + suffix;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(str: string): string {
  return str.replace(/<\/?[^>]+(>|$)/g, "");
}

export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (c) => map[c]);
}

export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return word;
  return plural ?? `${word}s`;
}

export function initials(name: string, maxChars = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, maxChars)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function maskString(str: string, visibleStart = 2, visibleEnd = 2, maskChar = "*"): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  return str.slice(0, visibleStart) + masked + str.slice(str.length - visibleEnd);
}

export function randomString(length = 8, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
  let out = "";
  for (let i = 0; i < length; i++) out += charset[Math.floor(Math.random() * charset.length)];
  return out;
}

export function template(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => String(vars[key] ?? ""));
}