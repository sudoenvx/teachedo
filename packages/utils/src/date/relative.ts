const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

/** "2 days ago", "in 3 hours" — for activity feeds, "last accessed" on course cards, etc. */
export function formatRelativeTime(date: Date | string, now = new Date(), locale = "en-US"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const diffSeconds = (new Date(date).getTime() - now.getTime()) / 1000;

  for (const [unit, secondsInUnit] of UNITS) {
    if (Math.abs(diffSeconds) >= secondsInUnit || unit === "second") {
      return rtf.format(Math.round(diffSeconds / secondsInUnit), unit);
    }
  }
  return rtf.format(0, "second");
}

/** "3d 4h left" style countdown, for assignment/quiz deadline badges. */
export function formatCountdown(target: Date | string, now = new Date()): string {
  const diffMs = new Date(target).getTime() - now.getTime();
  if (diffMs <= 0) return "Overdue";

  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}