/** Matches backend PASSWORD_PATTERN in auth/schemas.py */

export const PASSWORD_MIN_LENGTH = 12;

export type PasswordChecks = {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  digit: boolean;
  special: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password: string): boolean {
  return Object.values(getPasswordChecks(password)).every(Boolean);
}

/** First failing rule, or null when valid. */
export function passwordValidationError(password: string): string | null {
  const checks = getPasswordChecks(password);
  if (!checks.minLength) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (!checks.uppercase) {
    return "Password must include an uppercase letter.";
  }
  if (!checks.lowercase) {
    return "Password must include a lowercase letter.";
  }
  if (!checks.digit) {
    return "Password must include a digit.";
  }
  if (!checks.special) {
    return "Password must include a special character.";
  }
  return null;
}

export function confirmPasswordError(
  password: string,
  confirm: string
): string | null {
  if (password !== confirm) {
    return "Passwords do not match.";
  }
  return null;
}

export function validateNewPassword(
  password: string,
  confirm: string
): string | null {
  return passwordValidationError(password) ?? confirmPasswordError(password, confirm);
}
