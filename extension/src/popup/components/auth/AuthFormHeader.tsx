type Props = {
  title: string;
  accent?: string;
  subtitle: string;
};

export function AuthFormHeader({ title, accent, subtitle }: Props) {
  return (
    <header className="auth-form-header">
      <h2 className="auth-form-header__title">
        {title}
        {accent && <span className="auth-form-header__accent"> {accent}</span>}
      </h2>
      <p className="auth-form-header__subtitle">{subtitle}</p>
    </header>
  );
}
