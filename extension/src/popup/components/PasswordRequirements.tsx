import { getPasswordChecks } from "../../shared/password-validation";

type Props = {
  password: string;
  confirm?: string;
  label?: string;
};

export function PasswordRequirements({ password, confirm, label }: Props) {
  const checks = getPasswordChecks(password);
  const showMatch = confirm !== undefined;
  const match = !showMatch || password === confirm;

  const items: { ok: boolean; text: string }[] = [
    { ok: checks.minLength, text: "At least 12 characters" },
    { ok: checks.uppercase, text: "One uppercase letter" },
    { ok: checks.lowercase, text: "One lowercase letter" },
    { ok: checks.digit, text: "One digit" },
    { ok: checks.special, text: "One special character" },
  ];

  if (showMatch) {
    items.push({
      ok: match && confirm.length > 0,
      text: "Passwords match",
    });
  }

  return (
    <div className="password-requirements" aria-live="polite">
      {label && <p className="password-requirements__label">{label}</p>}
      <ul className="password-requirements__list">
        {items.map((item) => (
          <li
            key={item.text}
            className={item.ok ? "password-requirements__item--ok" : "password-requirements__item"}
          >
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
