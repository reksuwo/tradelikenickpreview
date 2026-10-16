/** Password rules shared by the browser checklist and the server actions. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", short: "at least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "lower", label: "A lowercase letter", short: "a lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "upper", label: "An uppercase letter", short: "an uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", short: "a number", test: (p: string) => /[0-9]/.test(p) },
  { id: "symbol", label: "A symbol, like ! @ # or $", short: "a symbol", test: (p: string) => /[^A-Za-z0-9\s]/.test(p) },
] as const;

/** Short names of the rules a password still fails. Empty means it is strong enough. */
export function passwordProblems(password: string): string[] {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.short);
}

/** One sentence naming what a password is missing, or null when it passes. */
export function passwordError(password: string): string | null {
  const missing = passwordProblems(password);
  if (missing.length === 0) return null;
  const list =
    missing.length === 1 ? missing[0] : `${missing.slice(0, -1).join(", ")} and ${missing.at(-1)}`;
  return `Your password needs ${list}.`;
}
