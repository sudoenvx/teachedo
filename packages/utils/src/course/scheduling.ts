export interface Deadline {
  dueAt: Date | string;
  /** grace period after due date before it's locked, in minutes */
  gracePeriodMinutes?: number;
}

export type DeadlineState = "upcoming" | "due-soon" | "overdue-grace" | "overdue-locked";

/** "due-soon" kicks in inside this window (default 24h) so UIs can show a warning badge. */
export function getDeadlineState(deadline: Deadline, dueSoonWindowMs = 24 * 60 * 60 * 1000, now = new Date()): DeadlineState {
  const dueAt = new Date(deadline.dueAt);
  const graceMs = (deadline.gracePeriodMinutes ?? 0) * 60 * 1000;
  const nowMs = now.getTime();

  if (nowMs < dueAt.getTime() - dueSoonWindowMs) return "upcoming";
  if (nowMs < dueAt.getTime()) return "due-soon";
  if (nowMs < dueAt.getTime() + graceMs) return "overdue-grace";
  return "overdue-locked";
}

export function canSubmit(deadline: Deadline, now = new Date()): boolean {
  const state = getDeadlineState(deadline, 0, now);
  return state !== "overdue-locked";
}

/** Is this submission late (past due but within/without grace)? Useful for flagging late-penalty logic. */
export function isLateSubmission(deadline: Deadline, submittedAt: Date, ignoreGrace = true): boolean {
  const dueAt = new Date(deadline.dueAt);
  if (ignoreGrace) return submittedAt.getTime() > dueAt.getTime();
  const graceMs = (deadline.gracePeriodMinutes ?? 0) * 60 * 1000;
  return submittedAt.getTime() > dueAt.getTime() + graceMs;
}