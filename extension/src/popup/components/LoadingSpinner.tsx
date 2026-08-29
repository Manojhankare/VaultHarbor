import type { CSSProperties, ReactNode } from "react";
import { BrandHeader } from "./BrandHeader";

type SpinnerSize = "sm" | "md" | "lg";

type Props = {
  size?: SpinnerSize;
  className?: string;
  label?: string;
};

export function LoadingSpinner({ size = "md", className = "", label }: Props) {
  return (
    <span
      className={`loading-spinner loading-spinner--${size} ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    />
  );
}

type ButtonProps = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
};

export function LoadingButton({
  loading,
  loadingLabel,
  children,
  className = "btn",
  type = "submit",
  disabled,
  style,
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={className}
      disabled={loading || disabled}
      style={style}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading ? (
        <span className="btn-loading">
          <LoadingSpinner size="sm" />
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

type ScreenProps = {
  message?: string;
  branded?: boolean;
};

export function LoadingScreen({ message = "Loading...", branded = false }: ScreenProps) {
  return (
    <div className="loading-screen">
      {branded && <BrandHeader />}
      <LoadingSpinner size="lg" />
      <p className="loading-screen__message">{message}</p>
    </div>
  );
}

/** Full-popup overlay while transitioning to the next screen after success. */
export function TransitionScreen({ message }: { message: string }) {
  return (
    <div className="app app--transition">
      <LoadingScreen branded message={message} />
    </div>
  );
}
