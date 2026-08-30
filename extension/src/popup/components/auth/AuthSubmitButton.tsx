import type { CSSProperties, ReactNode } from "react";
import { IconLock } from "../icons/Icon";
import { LoadingButton } from "../LoadingSpinner";

type Props = {
  loading: boolean;
  loadingLabel: string;
  children: ReactNode;
  style?: CSSProperties;
};

export function AuthSubmitButton({ loading, loadingLabel, children, style }: Props) {
  return (
    <LoadingButton
      className="btn auth-submit"
      loading={loading}
      loadingLabel={loadingLabel}
      style={{ width: "100%", ...style }}
    >
      {!loading && <IconLock size={18} className="auth-submit__icon" />}
      <span>{children}</span>
    </LoadingButton>
  );
}
