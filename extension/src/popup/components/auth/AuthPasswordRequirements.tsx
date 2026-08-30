import { PasswordRequirements } from "../PasswordRequirements";

type Props = {
  password: string;
  confirm?: string;
  label?: string;
};

/** Requirement pills with checkmarks — used on register & reset flows. */
export function AuthPasswordRequirements({ password, confirm, label }: Props) {
  return (
    <PasswordRequirements
      password={password}
      confirm={confirm}
      label={label ?? "Your password must include:"}
    />
  );
}
