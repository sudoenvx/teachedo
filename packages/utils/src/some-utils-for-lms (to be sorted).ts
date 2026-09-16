/** Every tenant-owned record should extend this. */
export interface TenantScoped {
  tenantId: string;
}

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  status: "active" | "trialing" | "past_due" | "suspended" | "canceled";
  createdAt: string;
  trialEndsAt?: string;
  customDomain?: string;
}

/** Resolve tenant slug from a subdomain, e.g. "acme.yourlms.com" -> "acme" */
export function resolveTenantFromHost(host: string, rootDomain: string): string | null {
  const cleanHost = host.replace(/:\d+$/, ""); // strip port
  if (cleanHost === rootDomain || cleanHost === `www.${rootDomain}`) return null;
  if (!cleanHost.endsWith(rootDomain)) return null; // likely a custom domain — look it up separately
  const sub = cleanHost.slice(0, -(rootDomain.length + 1));
  return sub || null;
}

/** Namespaced cache/storage keys so tenants never collide, e.g. "acme:courses:list" */
export function tenantKey(tenantId: string, ...parts: (string | number)[]): string {
  return [tenantId, ...parts].join(":");
}

/** Guard to ensure a record belongs to the active tenant before mutating/reading it. */
export function assertBelongsToTenant<T extends TenantScoped>(record: T, tenantId: string, entityName = "Resource"): T {
  if (record.tenantId !== tenantId) {
    throw new TenantMismatchError(entityName);
  }
  return record;
}

export class TenantMismatchError extends Error {
  constructor(entityName: string) {
    super(`${entityName} does not belong to the current tenant`);
    this.name = "TenantMismatchError";
  }
}

export function isTenantActive(tenant: Tenant): boolean {
  return tenant.status === "active" || tenant.status === "trialing";
}

export function isTrialExpired(tenant: Tenant): boolean {
  if (tenant.status !== "trialing" || !tenant.trialEndsAt) return false;
  return new Date(tenant.trialEndsAt).getTime() < Date.now();
}

export function trialDaysRemaining(tenant: Tenant): number {
  if (!tenant.trialEndsAt) return 0;
  const ms = new Date(tenant.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

/** validates a tenant slug the teacher picks on signup: lowercase, alnum + hyphen, 3-30 chars */
export function isValidTenantSlug(slug: string): boolean {
  return /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/.test(slug);
}

const RESERVED_SLUGS = new Set(["www", "app", "api", "admin", "dashboard", "auth", "mail", "static", "support"]);
export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}


// =============

export type LmsRole = "owner" | "teacher" | "teaching_assistant" | "student" | "guardian";

export type Permission =
  | "course:create" | "course:edit" | "course:delete" | "course:publish"
  | "student:invite" | "student:remove" | "student:view_grades" | "student:message"
  | "assignment:create" | "assignment:grade" | "assignment:submit"
  | "quiz:create" | "quiz:attempt" | "quiz:view_results"
  | "billing:manage" | "settings:manage" | "analytics:view";

const ROLE_PERMISSIONS: Record<LmsRole, Permission[]> = {
  owner: [
    "course:create", "course:edit", "course:delete", "course:publish",
    "student:invite", "student:remove", "student:view_grades", "student:message",
    "assignment:create", "assignment:grade",
    "quiz:create", "quiz:view_results",
    "billing:manage", "settings:manage", "analytics:view",
  ],
  teacher: [
    "course:create", "course:edit", "course:publish",
    "student:invite", "student:view_grades", "student:message",
    "assignment:create", "assignment:grade",
    "quiz:create", "quiz:view_results",
    "analytics:view",
  ],
  teaching_assistant: [
    "student:view_grades", "student:message",
    "assignment:grade", "quiz:view_results",
  ],
  student: ["assignment:submit", "quiz:attempt"],
  guardian: ["student:view_grades"],
};

export function can(role: LmsRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(role: LmsRole, permissions: Permission[]): boolean {
  return permissions.some((p) => can(role, p));
}

export function canAll(role: LmsRole, permissions: Permission[]): boolean {
  return permissions.every((p) => can(role, p));
}

export function getPermissionsForRole(role: LmsRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function isStaffRole(role: LmsRole): boolean {
  return role === "owner" || role === "teacher" || role === "teaching_assistant";
}

export function assertPermission(role: LmsRole, permission: Permission): void {
  if (!can(role, permission)) {
    throw new PermissionDeniedError(role, permission);
  }
}

export class PermissionDeniedError extends Error {
  constructor(role: LmsRole, permission: Permission) {
    super(`Role "${role}" lacks permission "${permission}"`);
    this.name = "PermissionDeniedError";
  }
}

// =============

export type EnrollmentStatus = "pending" | "active" | "completed" | "dropped" | "waitlisted" | "suspended";

export interface CourseCapacity {
  maxSeats: number | null; // null = unlimited
  enrolledCount: number;
  waitlistCount: number;
}

export function hasAvailableSeats(capacity: CourseCapacity): boolean {
  if (capacity.maxSeats === null) return true;
  return capacity.enrolledCount < capacity.maxSeats;
}

export function seatsRemaining(capacity: CourseCapacity): number | null {
  if (capacity.maxSeats === null) return null;
  return Math.max(0, capacity.maxSeats - capacity.enrolledCount);
}

/** Decide what should happen when a student tries to enroll. */
export function resolveEnrollmentAction(capacity: CourseCapacity, allowWaitlist: boolean): "enroll" | "waitlist" | "reject" {
  if (hasAvailableSeats(capacity)) return "enroll";
  if (allowWaitlist) return "waitlist";
  return "reject";
}

// valid transitions — prevents e.g. going from "dropped" straight to "completed"
const VALID_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  pending: ["active", "dropped"],
  waitlisted: ["active", "dropped"],
  active: ["completed", "dropped", "suspended"],
  suspended: ["active", "dropped"],
  completed: [],
  dropped: ["pending"], // allow re-enrollment
};

export function canTransitionEnrollment(from: EnrollmentStatus, to: EnrollmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertValidEnrollmentTransition(from: EnrollmentStatus, to: EnrollmentStatus): void {
  if (!canTransitionEnrollment(from, to)) {
    throw new Error(`Invalid enrollment transition: ${from} -> ${to}`);
  }
}

export interface InviteCode {
  code: string;
  courseId: string;
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
}

export function isInviteCodeValid(invite: InviteCode): boolean {
  if (invite.expiresAt && new Date(invite.expiresAt).getTime() < Date.now()) return false;
  if (invite.maxUses !== undefined && invite.usedCount >= invite.maxUses) return false;
  return true;
}

export function generateInviteCode(length = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars (0/O, 1/I)
  let code = "";
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ==========

export interface GradeItem {
  score: number;
  maxScore: number;
  weight?: number; // percentage weight within category, e.g. 0.3 for 30%
  category?: string;
}

export function toPercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 10000) / 100;
}

/** simple average across items, ignoring weight */
export function calculateAverage(items: GradeItem[]): number {
  if (!items.length) return 0;
  const percentages = items.map((i) => toPercentage(i.score, i.maxScore));
  return Math.round((percentages.reduce((a, b) => a + b, 0) / items.length) * 100) / 100;
}

/** weighted grade, e.g. quizzes 20%, assignments 30%, final exam 50% */
export function calculateWeightedGrade(items: GradeItem[]): number {
  const totalWeight = items.reduce((sum, i) => sum + (i.weight ?? 0), 0);
  if (totalWeight === 0) return calculateAverage(items);

  const weightedSum = items.reduce((sum, i) => sum + toPercentage(i.score, i.maxScore) * (i.weight ?? 0), 0);
  return Math.round((weightedSum / totalWeight) * 100) / 100;
}

/** groups by category first (e.g. average all quiz scores), then weights categories */
export function calculateCategoryWeightedGrade(items: GradeItem[], categoryWeights: Record<string, number>): number {
  const grouped = items.reduce<Record<string, GradeItem[]>>((acc, item) => {
    const cat = item.category ?? "uncategorized";
    (acc[cat] ??= []).push(item);
    return acc;
  }, {});

  let totalWeight = 0;
  let weightedSum = 0;

  for (const [category, categoryItems] of Object.entries(grouped)) {
    const weight = categoryWeights[category] ?? 0;
    const categoryAvg = calculateAverage(categoryItems);
    weightedSum += categoryAvg * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : Math.round((weightedSum / totalWeight) * 100) / 100;
}

export interface GradeScale {
  min: number;
  letter: string;
  gpa: number;
}

export const DEFAULT_GRADE_SCALE: GradeScale[] = [
  { min: 97, letter: "A+", gpa: 4.0 },
  { min: 93, letter: "A", gpa: 4.0 },
  { min: 90, letter: "A-", gpa: 3.7 },
  { min: 87, letter: "B+", gpa: 3.3 },
  { min: 83, letter: "B", gpa: 3.0 },
  { min: 80, letter: "B-", gpa: 2.7 },
  { min: 77, letter: "C+", gpa: 2.3 },
  { min: 73, letter: "C", gpa: 2.0 },
  { min: 70, letter: "C-", gpa: 1.7 },
  { min: 60, letter: "D", gpa: 1.0 },
  { min: 0, letter: "F", gpa: 0.0 },
];

export function percentageToLetterGrade(percentage: number, scale: GradeScale[] = DEFAULT_GRADE_SCALE): string {
  return (scale.find((s) => percentage >= s.min) ?? scale[scale.length - 1]).letter;
}

export function percentageToGpa(percentage: number, scale: GradeScale[] = DEFAULT_GRADE_SCALE): number {
  return (scale.find((s) => percentage >= s.min) ?? scale[scale.length - 1]).gpa;
}

export function calculateGpa(percentages: number[], scale: GradeScale[] = DEFAULT_GRADE_SCALE): number {
  if (!percentages.length) return 0;
  const total = percentages.reduce((sum, p) => sum + percentageToGpa(p, scale), 0);
  return Math.round((total / percentages.length) * 100) / 100;
}

export function isPassingGrade(percentage: number, passingThreshold = 60): boolean {
  return percentage >= passingThreshold;
}

/** late-submission penalty, e.g. -10% per day late, capped */
export function applyLatePenalty(score: number, daysLate: number, penaltyPerDay = 10, maxPenalty = 50): number {
  const penalty = Math.min(daysLate * penaltyPerDay, maxPenalty);
  return Math.max(0, score - (score * penalty) / 100);
}

/** curve everyone's score so the top scorer hits `targetMax` (simple additive curve) */
export function applyCurve(scores: number[], targetMax = 100): number[] {
  const highest = Math.max(...scores);
  const adjustment = targetMax - highest;
  return scores.map((s) => Math.min(targetMax, Math.round((s + adjustment) * 100) / 100));
}


//=========

export interface QuizQuestion {
  id: string;
  points: number;
  correctOptionIds: string[]; // supports single or multi-select
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuizResult {
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  breakdown: { questionId: string; correct: boolean; pointsEarned: number }[];
}

export function gradeQuiz(questions: QuizQuestion[], answers: QuizAnswer[], passingPercentage = 60): QuizResult {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedOptionIds]));

  const breakdown = questions.map((q) => {
    const selected = answerMap.get(q.id) ?? [];
    const correct = arraysMatchIgnoreOrder(selected, q.correctOptionIds);
    return { questionId: q.id, correct, pointsEarned: correct ? q.points : 0 };
  });

  const score = breakdown.reduce((sum, b) => sum + b.pointsEarned, 0);
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
  const percentage = maxScore === 0 ? 0 : Math.round((score / maxScore) * 10000) / 100;

  return {
    score,
    maxScore,
    percentage,
    passed: percentage >= passingPercentage,
    correctCount: breakdown.filter((b) => b.correct).length,
    totalQuestions: questions.length,
    breakdown,
  };
}

function arraysMatchIgnoreOrder(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((item) => setA.has(item));
}

/** Fisher-Yates shuffle — use to randomize question/option order per attempt */
export function shuffleQuestions<T>(items: T[], seed?: number): T[] {
  const arr = [...items];
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// deterministic PRNG so the same student always gets the same shuffle for a given attempt
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface AttemptWindow {
  startedAt: string;
  timeLimitMinutes: number;
}

export function getRemainingSeconds(window: AttemptWindow): number {
  const deadline = new Date(window.startedAt).getTime() + window.timeLimitMinutes * 60_000;
  return Math.max(0, Math.round((deadline - Date.now()) / 1000));
}

export function isAttemptExpired(window: AttemptWindow): boolean {
  return getRemainingSeconds(window) <= 0;
}

export function canRetakeQuiz(attemptsUsed: number, maxAttempts: number | null): boolean {
  if (maxAttempts === null) return true;
  return attemptsUsed < maxAttempts;
}

/** best/average/latest — how the final recorded score is picked across multiple attempts */
export function resolveFinalScore(scores: number[], strategy: "best" | "average" | "latest"): number {
  if (!scores.length) return 0;
  switch (strategy) {
    case "best": return Math.max(...scores);
    case "average": return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    case "latest": return scores[scores.length - 1];
  }
}

// ===========

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  studentId: string;
  sessionId: string;
  status: AttendanceStatus;
  date: string;
}

export function calculateAttendanceRate(records: AttendanceRecord[]): number {
  if (!records.length) return 0;
  // "excused" absences don't count against the student
  const countable = records.filter((r) => r.status !== "excused");
  if (!countable.length) return 100;
  const present = countable.filter((r) => r.status === "present" || r.status === "late").length;
  return Math.round((present / countable.length) * 10000) / 100;
}

export function getAttendanceStreak(records: AttendanceRecord[]): number {
  const sorted = [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  for (const record of sorted) {
    if (record.status === "present" || record.status === "excused") streak++;
    else break;
  }
  return streak;
}

export function isAtRiskAttendance(records: AttendanceRecord[], threshold = 80): boolean {
  return calculateAttendanceRate(records) < threshold;
}

export function groupAttendanceByStudent(records: AttendanceRecord[]): Record<string, AttendanceRecord[]> {
  return records.reduce<Record<string, AttendanceRecord[]>>((acc, r) => {
    (acc[r.studentId] ??= []).push(r);
    return acc;
  }, {});
}

export function summarizeAttendance(records: AttendanceRecord[]) {
  return {
    present: records.filter((r) => r.status === "present").length,
    absent: records.filter((r) => r.status === "absent").length,
    late: records.filter((r) => r.status === "late").length,
    excused: records.filter((r) => r.status === "excused").length,
    rate: calculateAttendanceRate(records),
  };
}

// =========

export interface ClassSession {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // "HH:mm" 24h
  endTime: string;
  timezone: string; // IANA, e.g. "Africa/Cairo"
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function doSessionsOverlap(a: ClassSession, b: ClassSession): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

/** find scheduling conflicts for a teacher/student across all their sessions */
export function findScheduleConflicts(sessions: ClassSession[]): [ClassSession, ClassSession][] {
  const conflicts: [ClassSession, ClassSession][] = [];
  for (let i = 0; i < sessions.length; i++) {
    for (let j = i + 1; j < sessions.length; j++) {
      if (doSessionsOverlap(sessions[i], sessions[j])) conflicts.push([sessions[i], sessions[j]]);
    }
  }
  return conflicts;
}

export function sessionDurationMinutes(session: ClassSession): number {
  return timeToMinutes(session.endTime) - timeToMinutes(session.startTime);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export function formatDayOfWeek(day: ClassSession["dayOfWeek"]): string {
  return DAY_NAMES[day];
}

/** Get the next occurrence of a weekly-recurring session, e.g. for "next class starts in..." */
export function getNextOccurrence(session: ClassSession, from = new Date()): Date {
  const result = new Date(from);
  const [h, m] = session.startTime.split(":").map(Number);
  const currentDay = result.getDay();
  let daysUntil = (session.dayOfWeek - currentDay + 7) % 7;

  // if it's today but the session already started, push to next week
  if (daysUntil === 0) {
    const nowMinutes = result.getHours() * 60 + result.getMinutes();
    if (nowMinutes >= timeToMinutes(session.startTime)) daysUntil = 7;
  }

  result.setDate(result.getDate() + daysUntil);
  result.setHours(h, m, 0, 0);
  return result;
}

export function isSessionLiveNow(session: ClassSession, now = new Date()): boolean {
  if (now.getDay() !== session.dayOfWeek) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return nowMinutes >= timeToMinutes(session.startTime) && nowMinutes < timeToMinutes(session.endTime);
}

/** expand a recurring weekly session into concrete calendar dates within a range */
export function expandRecurringSession(session: ClassSession, rangeStart: Date, rangeEnd: Date): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(rangeStart);
  while (cursor <= rangeEnd) {
    if (cursor.getDay() === session.dayOfWeek) {
      const [h, m] = session.startTime.split(":").map(Number);
      const occurrence = new Date(cursor);
      occurrence.setHours(h, m, 0, 0);
      if (occurrence >= rangeStart && occurrence <= rangeEnd) dates.push(occurrence);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}


// ===============

export type ContentType = "video" | "reading" | "quiz" | "assignment" | "live_session" | "file";

export interface LessonNode {
  id: string;
  title: string;
  type: ContentType;
  durationMinutes?: number;
  order: number;
  moduleId: string;
  /** null = available immediately; else unlock rule */
  unlockAfterLessonId?: string | null;
  unlockAt?: string; // ISO date for drip content
}

export interface ModuleNode {
  id: string;
  title: string;
  order: number;
  lessons: LessonNode[];
}

export function flattenCurriculum(modules: ModuleNode[]): LessonNode[] {
  return [...modules]
    .sort((a, b) => a.order - b.order)
    .flatMap((m) => [...m.lessons].sort((a, b) => a.order - b.order));
}

export function calculateTotalDuration(modules: ModuleNode[]): number {
  return flattenCurriculum(modules).reduce((sum, l) => sum + (l.durationMinutes ?? 0), 0);
}

export function formatCourseDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Is this lesson unlocked for a given student, based on prerequisites + drip date + completed lesson set */
export function isLessonUnlocked(lesson: LessonNode, completedLessonIds: Set<string>, now = new Date()): boolean {
  if (lesson.unlockAt && new Date(lesson.unlockAt) > now) return false;
  if (lesson.unlockAfterLessonId && !completedLessonIds.has(lesson.unlockAfterLessonId)) return false;
  return true;
}

export function getNextLesson(modules: ModuleNode[], completedLessonIds: Set<string>): LessonNode | null {
  const flat = flattenCurriculum(modules);
  return flat.find((l) => !completedLessonIds.has(l.id) && isLessonUnlocked(l, completedLessonIds)) ?? null;
}

export function countLessonsByType(modules: ModuleNode[]): Record<ContentType, number> {
  const flat = flattenCurriculum(modules);
  return flat.reduce((acc, l) => {
    acc[l.type] = (acc[l.type] ?? 0) + 1;
    return acc;
  }, {} as Record<ContentType, number>);
}


// ====== 

export interface LessonProgress {
  lessonId: string;
  status: "not_started" | "in_progress" | "completed";
  completedAt?: string;
  watchedSeconds?: number; // for video lessons
  totalSeconds?: number;
}

export function calculateCourseProgress(allLessonIds: string[], progressRecords: LessonProgress[]): number {
  if (!allLessonIds.length) return 0;
  const completedSet = new Set(
    progressRecords.filter((p) => p.status === "completed").map((p) => p.lessonId)
  );
  const completedCount = allLessonIds.filter((id) => completedSet.has(id)).length;
  return Math.round((completedCount / allLessonIds.length) * 10000) / 100;
}

export function isCourseCompleted(allLessonIds: string[], progressRecords: LessonProgress[]): boolean {
  return calculateCourseProgress(allLessonIds, progressRecords) === 100;
}

export function getVideoWatchPercentage(progress: LessonProgress): number {
  if (!progress.totalSeconds) return 0;
  return Math.min(100, Math.round(((progress.watchedSeconds ?? 0) / progress.totalSeconds) * 10000) / 100);
}

/** auto-mark video complete once they've watched past a threshold (handles skipping to the end) */
export function shouldAutoCompleteVideo(progress: LessonProgress, thresholdPercent = 90): boolean {
  return getVideoWatchPercentage(progress) >= thresholdPercent;
}

export interface StudentActivitySummary {
  lastActiveAt?: string;
  completedLessonsLast7Days: number;
  completedLessonsLast30Days: number;
}

/** flag inactive students so a teacher can nudge them */
export function isStudentInactive(lastActiveAt: string | undefined, inactiveDays = 7): boolean {
  if (!lastActiveAt) return true;
  const daysSinceActive = (Date.now() - new Date(lastActiveAt).getTime()) / 86_400_000;
  return daysSinceActive >= inactiveDays;
}

/** simple heuristic combining progress velocity + attendance + grades to flag at-risk students */
export function calculateRiskScore(input: {
  progressPercentage: number;
  attendanceRate: number;
  averageGrade: number;
  daysSinceLastActive: number;
}): { score: number; level: "low" | "medium" | "high" } {
  const progressPenalty = (100 - input.progressPercentage) * 0.3;
  const attendancePenalty = (100 - input.attendanceRate) * 0.3;
  const gradePenalty = (100 - input.averageGrade) * 0.25;
  const inactivityPenalty = Math.min(input.daysSinceLastActive * 2, 15);

  const score = Math.round(Math.min(100, progressPenalty + attendancePenalty + gradePenalty + inactivityPenalty));
  const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { score, level };
}


// ==========

export interface CertificateEligibility {
  minProgressPercentage: number;
  minGrade?: number;
  requiresAllQuizzesPassed: boolean;
}

export function isEligibleForCertificate(
  input: { progressPercentage: number; averageGrade: number; allQuizzesPassed: boolean },
  rules: CertificateEligibility
): boolean {
  if (input.progressPercentage < rules.minProgressPercentage) return false;
  if (rules.minGrade !== undefined && input.averageGrade < rules.minGrade) return false;
  if (rules.requiresAllQuizzesPassed && !input.allQuizzesPassed) return false;
  return true;
}

export function generateCertificateId(tenantSlug: string, studentId: string, courseId: string): string {
  const hash = simpleHash(`${tenantSlug}:${studentId}:${courseId}:${Date.now()}`);
  return `CERT-${tenantSlug.slice(0, 4).toUpperCase()}-${hash}`;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash << 5) - hash + str.charCodeAt(i);
  return Math.abs(hash).toString(36).toUpperCase().padStart(8, "0").slice(0, 8);
}

/** verification code that's short enough to type but hard to guess sequentially */
export function generateVerificationCode(): string {
  return Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join("-");
}


// ============

export interface PlanLimits {
  maxStudents: number | null;
  maxCourses: number | null;
  maxStorageGb: number;
  allowsLiveSessions: boolean;
  allowsCertificates: boolean;
  allowsCustomDomain: boolean;
}

export const PLAN_LIMITS: Record<"free" | "starter" | "pro" | "enterprise", PlanLimits> = {
  free: { maxStudents: 25, maxCourses: 1, maxStorageGb: 1, allowsLiveSessions: false, allowsCertificates: false, allowsCustomDomain: false },
  starter: { maxStudents: 150, maxCourses: 5, maxStorageGb: 10, allowsLiveSessions: true, allowsCertificates: true, allowsCustomDomain: false },
  pro: { maxStudents: 1000, maxCourses: null, maxStorageGb: 50, allowsLiveSessions: true, allowsCertificates: true, allowsCustomDomain: true },
  enterprise: { maxStudents: null, maxCourses: null, maxStorageGb: 500, allowsLiveSessions: true, allowsCertificates: true, allowsCustomDomain: true },
};

export function isWithinStudentLimit(plan: keyof typeof PLAN_LIMITS, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].maxStudents;
  return limit === null || currentCount < limit;
}

export function isWithinCourseLimit(plan: keyof typeof PLAN_LIMITS, currentCount: number): boolean {
  const limit = PLAN_LIMITS[plan].maxCourses;
  return limit === null || currentCount < limit;
}

export function getUsagePercentage(current: number, limit: number | null): number {
  if (limit === null) return 0;
  return Math.min(100, Math.round((current / limit) * 10000) / 100);
}

export function isApproachingLimit(current: number, limit: number | null, threshold = 90): boolean {
  if (limit === null) return false;
  return getUsagePercentage(current, limit) >= threshold;
}

export function formatStorageUsage(usedGb: number, limitGb: number): string {
  return `${usedGb.toFixed(1)} GB / ${limitGb} GB`;
}


// ======


export interface CourseEngagementInput {
  enrolledCount: number;
  activeLast7Days: number;
  averageProgress: number;
  averageGrade: number;
  completionCount: number;
}

export function calculateCompletionRate(input: { enrolledCount: number; completionCount: number }): number {
  if (input.enrolledCount === 0) return 0;
  return Math.round((input.completionCount / input.enrolledCount) * 10000) / 100;
}

export function calculateEngagementRate(input: { enrolledCount: number; activeLast7Days: number }): number {
  if (input.enrolledCount === 0) return 0;
  return Math.round((input.activeLast7Days / input.enrolledCount) * 10000) / 100;
}

/** bucket students by grade range for a teacher's grade-distribution chart */
export function buildGradeDistribution(grades: number[], bucketSize = 10): { range: string; count: number }[] {
  const buckets: Record<string, number> = {};
  for (let start = 0; start < 100; start += bucketSize) {
    buckets[`${start}-${start + bucketSize}`] = 0;
  }
  for (const grade of grades) {
    const bucketStart = Math.min(90, Math.floor(grade / bucketSize) * bucketSize);
    const key = `${bucketStart}-${bucketStart + bucketSize}`;
    buckets[key] = (buckets[key] ?? 0) + 1;
  }
  return Object.entries(buckets).map(([range, count]) => ({ range, count }));
}

/** week-over-week trend arrow for a dashboard stat */
export function calculateTrend(current: number, previous: number): { direction: "up" | "down" | "flat"; changePercent: number } {
  if (previous === 0) return { direction: current > 0 ? "up" : "flat", changePercent: 0 };
  const change = ((current - previous) / previous) * 100;
  return {
    direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
    changePercent: Math.round(change * 100) / 100,
  };
}

export function rankStudentsByGrade<T extends { studentId: string; grade: number }>(students: T[]): (T & { rank: number })[] {
  return [...students]
    .sort((a, b) => b.grade - a.grade)
    .map((s, i) => ({ ...s, rank: i + 1 }));
}