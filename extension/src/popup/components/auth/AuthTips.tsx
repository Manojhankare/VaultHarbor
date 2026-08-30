import { useState } from "react";
import { IconShield } from "../icons/Icon";
type Props = {
  title?: string;
  body?: string;
};

export function AuthTips({
  title = "Tips for a strong password",
  body = "Avoid using personal information or common words.",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`auth-tips${open ? " auth-tips--open" : ""}`}>
      <button
        type="button"
        className="auth-tips__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <IconShield size={18} className="auth-tips__icon" />
        <span className="auth-tips__text">
          <strong>{title}</strong>
          <span className="auth-tips__preview">{body}</span>
        </span>
        <span className="auth-tips__chevron" aria-hidden="true">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && <p className="auth-tips__body">{body}</p>}
    </div>
  );
}
