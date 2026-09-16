export function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function nanoid(size = 12): string {
  const alphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHIJKLNQRTUVWXYZ_abcdefghijklmnopqrstuvwxyz";
  let id = "";
  const bytes = typeof crypto !== "undefined" ? crypto.getRandomValues(new Uint8Array(size)) : Array.from({ length: size }, () => Math.floor(Math.random() * 256));
  for (let i = 0; i < size; i++) id += alphabet[bytes[i] & 63];
  return id;
}

export function shortId(prefix?: string): string {
  const id = Math.random().toString(36).slice(2, 10);
  return prefix ? `${prefix}_${id}` : id;
}