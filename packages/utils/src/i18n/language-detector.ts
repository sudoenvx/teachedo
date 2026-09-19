import { Language } from "./language";
import { useMemo } from "react";

const ARABIC_PATTERN = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g;
const ENGLISH_PATTERN = /[a-zA-Z]/g;

export const detectLanguage = (input: string): Language => {
  if (input.length === 0) return Language.Arabic;

  const trimmed = String(input).trim();
  if (!trimmed) return Language.Unknown;

  const arabicCount = trimmed.match(ARABIC_PATTERN)?.length ?? 0;
  const englishCount = trimmed.match(ENGLISH_PATTERN)?.length ?? 0;

  if (arabicCount === 0 && englishCount === 0) return Language.Unknown;
  if (arabicCount > 0 && englishCount === 0) return Language.Arabic;
  if (englishCount > 0 && arabicCount === 0) return Language.English;

  // Both scripts present — decide by dominance, otherwise call it Mixed
  const total = arabicCount + englishCount;
  const arabicRatio = arabicCount / total;

  if (arabicRatio >= 0.8) return Language.Arabic;
  if (arabicRatio <= 0.2) return Language.English;
  return Language.Mixed;
};

export const useDetectedLanguage = (input: string): Language => {
  return useMemo(() => detectLanguage(input), [input]);
};