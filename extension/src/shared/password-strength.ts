import { getPasswordChecks, PASSWORD_MIN_LENGTH } from "./password-validation";

export type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export function getPasswordStrength(password: string): {
  level: StrengthLevel;
  label: string;
  segments: number;
} {
  if (!password) {
    return { level: "empty", label: "", segments: 0 };
  }

  const checks = getPasswordChecks(password);
  const passed = Object.values(checks).filter(Boolean).length;
  const lenBonus = password.length >= PASSWORD_MIN_LENGTH + 4 ? 1 : 0;
  const score = passed + lenBonus;

  if (score <= 2) {
    return { level: "weak", label: "Weak", segments: 1 };
  }
  if (score <= 3) {
    return { level: "fair", label: "Fair", segments: 2 };
  }
  if (score <= 4 || !checks.special) {
    return { level: "good", label: "Good", segments: 3 };
  }
  return { level: "strong", label: "Strong", segments: 4 };
}
