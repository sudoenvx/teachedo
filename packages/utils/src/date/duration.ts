/** Course/lesson video length: 90 -> "1:30", 3661 -> "1:01:01" */
export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);

  const pad = (n: number) => String(n).padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** "4 weeks", "12 hours" — for course-length metadata on catalog cards. */
export function formatCourseLength(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < 24) return `${Math.round(hours)} hr${hours >= 2 ? "s" : ""}`;
  const days = Math.round(hours / 24);
  return `${days} day${days >= 2 ? "s" : ""}`;
}