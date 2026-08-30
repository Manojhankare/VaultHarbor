import { getPasswordStrength } from "../../../shared/password-strength";

export function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength__meter-row">
        <div
          className="auth-strength__meter"
          role="meter"
          aria-valuenow={strength.segments}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`Password strength: ${strength.label}`}
        >
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`auth-strength__segment${
                n <= strength.segments ? ` auth-strength__segment--${strength.level}` : ""
              }`}
            />
          ))}
        </div>
        <span className={`auth-strength__label auth-strength__label--${strength.level}`}>
          {strength.label}
        </span>
      </div>
      <p className="auth-strength__hint">Use a mix of letters, numbers and symbols.</p>
    </div>
  );
}

export function PasswordMatchHint({
  password,
  confirm,
}: {
  password: string;
  confirm: string;
}) {
  if (!confirm) return null;
  const matches = password === confirm;

  return (
    <p className={`auth-strength__match${matches ? " auth-strength__match--ok" : ""}`}>
      {matches ? "✓ Passwords match" : "Passwords do not match"}
    </p>
  );
}
