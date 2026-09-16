export interface GradedItem {
  /** e.g. "quiz", "assignment", "final_exam" */
  category: string;
  /** weight as a fraction of 1 within its category's rollup, or as an absolute weight — see calculateWeightedGrade */
  score: number; // points earned
  maxScore: number; // points possible
  weight?: number; // weight of this item's category in the overall grade
}

export interface CategoryWeights {
  [category: string]: number; // should sum to 1 (or 100 — normalized internally)
}

/**
 * Weighted grade rollup: quizzes 20%, assignments 50%, final 30%, etc.
 * Falls back to simple points-based average if no weights are supplied.
 */
export function calculateWeightedGrade(items: GradedItem[], weights?: CategoryWeights): number {
  if (!weights) {
    const totalEarned = items.reduce((sum, i) => sum + i.score, 0);
    const totalPossible = items.reduce((sum, i) => sum + i.maxScore, 0);
    return totalPossible === 0 ? 0 : round2((totalEarned / totalPossible) * 100);
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const byCategory = groupByCategory(items);

  let weightedSum = 0;
  for (const [category, categoryItems] of Object.entries(byCategory)) {
    const categoryWeight = (weights[category] ?? 0) / totalWeight;
    const earned = categoryItems.reduce((sum, i) => sum + i.score, 0);
    const possible = categoryItems.reduce((sum, i) => sum + i.maxScore, 0);
    const categoryPct = possible === 0 ? 0 : earned / possible;
    weightedSum += categoryPct * categoryWeight;
  }

  return round2(weightedSum * 100);
}

function groupByCategory(items: GradedItem[]) {
  return items.reduce<Record<string, GradedItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const LETTER_SCALE: [number, string][] = [
  [97, "A+"], [93, "A"], [90, "A-"],
  [87, "B+"], [83, "B"], [80, "B-"],
  [77, "C+"], [73, "C"], [70, "C-"],
  [67, "D+"], [60, "D"], [0, "F"],
];

export function scoreToLetterGrade(percent: number): string {
  return LETTER_SCALE.find(([min]) => percent >= min)?.[1] ?? "F";
}

export function isPassing(percent: number, passThreshold = 70): boolean {
  return percent >= passThreshold;
}

/** For a single quiz attempt: correct answers / total questions. */
export function calculateQuizScore(correctCount: number, totalQuestions: number): number {
  return totalQuestions === 0 ? 0 : round2((correctCount / totalQuestions) * 100);
}