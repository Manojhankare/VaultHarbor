import type { PasswordGenOptions } from "../shared/messages";

const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnopqrstuvwxyz";
const NUMBERS = "23456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}";
const AMBIGUOUS = "0O1lI|`\"'\\";

function buildCharset(options: PasswordGenOptions): string {
  let charset = "";
  if (options.uppercase) charset += UPPER;
  if (options.lowercase) charset += LOWER;
  if (options.numbers) charset += NUMBERS;
  if (options.symbols) charset += SYMBOLS;
  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }
  if (charset.length === 0) {
    charset = LOWER + NUMBERS;
  }
  return charset;
}

export function generatePassword(options: PasswordGenOptions): string {
  const charset = buildCharset(options);
  const length = Math.max(8, Math.min(128, options.length));
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[bytes[i]! % charset.length];
  }
  return password;
}

export const DEFAULT_GEN_OPTIONS: PasswordGenOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
};
