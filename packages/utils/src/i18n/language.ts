export const Language = {
  Arabic: "Arabic",
  English: "English",
  Mixed: "Mixed",
  Unknown: "Unknown",
} as const;

export type Language = (typeof Language)[keyof typeof Language];