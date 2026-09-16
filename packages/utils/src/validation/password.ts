export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4; // weak -> strong
  issues: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const issues: string[] = [];
  if (password.length < 8) issues.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) issues.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) issues.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) issues.push("At least one number");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("At least one symbol");

  const score = Math.max(0, Math.min(4, 4 - issues.length)) as PasswordStrength["score"];
  return { score, issues };
}