export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  /** for video/scorm lessons — seconds watched vs total */
  secondsWatched?: number;
  totalSeconds?: number;
}

export interface ModuleProgress {
  moduleId: string;
  lessons: LessonProgress[];
}

/** 0-100. A lesson counts as complete only if `completed`, not just "watched enough". */
export function calculateCourseProgress(modules: ModuleProgress[]): number {
  const allLessons = modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) return 0;
  const completed = allLessons.filter((l) => l.completed).length;
  return Math.round((completed / allLessons.length) * 100);
}

export function calculateModuleProgress(module: ModuleProgress): number {
  if (module.lessons.length === 0) return 0;
  const completed = module.lessons.filter((l) => l.completed).length;
  return Math.round((completed / module.lessons.length) * 100);
}

/** A video/audio lesson auto-completes once watched past this threshold. */
export function isLessonAutoComplete(lesson: LessonProgress, threshold = 0.9): boolean {
  if (!lesson.totalSeconds || !lesson.secondsWatched) return false;
  return lesson.secondsWatched / lesson.totalSeconds >= threshold;
}

export function nextIncompleteLesson(modules: ModuleProgress[]): LessonProgress | undefined {
  for (const module of modules) {
    const next = module.lessons.find((l) => !l.completed);
    if (next) return next;
  }
  return undefined;
}