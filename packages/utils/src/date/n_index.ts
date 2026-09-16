const DAY_MS = 86_400_000;

export function formatDate(date: Date | string | number, options?: Intl.DateTimeFormatOptions, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, options ?? { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

export function timeAgo(date: Date | string | number, locale = "en-US"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffSeconds = (new Date(date).getTime() - Date.now()) / 1000;

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
    ["second", 1],
  ];

  for (const [unit, secondsInUnit] of units) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return rtf.format(0, "second");
}

export function addDays(date: Date | string | number, days: number): Date {
  return new Date(new Date(date).getTime() + days * DAY_MS);
}

export function addMonths(date: Date | string | number, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function diffInDays(a: Date | string | number, b: Date | string | number): number {
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / DAY_MS);
}

export function isSameDay(a: Date | string | number, b: Date | string | number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function isToday(date: Date | string | number): boolean {
  return isSameDay(date, new Date());
}

export function isPast(date: Date | string | number): boolean {
  return new Date(date).getTime() < Date.now();
}

export function isFuture(date: Date | string | number): boolean {
  return new Date(date).getTime() > Date.now();
}

export function startOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date | string | number): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function toISODateString(date: Date | string | number): string {
  return new Date(date).toISOString().split("T")[0];
}

/** ms -> "1h 24m 03s" style duration */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h && `${h}h`, (h || m) && `${m}m`, `${s}s`].filter(Boolean).join(" ");
}