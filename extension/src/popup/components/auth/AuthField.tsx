import { useState, type ReactNode } from "react";
import {
  IconEye,
  IconEyeOff,
  IconKey,
  IconLock,
  IconMail,
} from "../icons/Icon";

type IconKind = "mail" | "lock" | "key";

type Props = {
  id: string;
  label: string;
  type?: "email" | "password" | "text";
  value: string;
  onChange?: (value: string) => void;
  icon?: IconKind;
  readOnly?: boolean;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: ReactNode;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
};

const FIELD_ICON_SIZE = 18;

function FieldIcon({ kind }: { kind: IconKind }) {
  const className = "auth-field__icon";
  if (kind === "mail") return <IconMail size={FIELD_ICON_SIZE} className={className} />;
  if (kind === "key") return <IconKey size={FIELD_ICON_SIZE} className={className} />;
  return <IconLock size={FIELD_ICON_SIZE} className={className} />;
}

export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  icon,
  readOnly = false,
  required,
  autoComplete,
  placeholder,
  hint,
  inputMode,
}: Props) {
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;

  return (
    <div className="auth-field">
      <div className="auth-field__label-row">
        <label htmlFor={id}>{label}</label>
        {hint}
      </div>
      <div className={`auth-field__control${readOnly ? " auth-field__control--readonly" : ""}`}>
        {icon && <FieldIcon kind={icon} />}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          spellCheck={false}
        />
        {isPassword && !readOnly && (
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? (
              <IconEyeOff size={FIELD_ICON_SIZE} className="auth-field__toggle-icon" />
            ) : (
              <IconEye size={FIELD_ICON_SIZE} className="auth-field__toggle-icon" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
