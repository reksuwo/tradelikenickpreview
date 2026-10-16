"use client";

import type { AuthState } from "@/lib/auth-actions";

export function Field({
  label,
  type,
  name,
  placeholder,
  autoComplete,
  trailing,
  minLength,
}: {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  trailing?: React.ReactNode;
  minLength?: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={name} className="text-[13.5px] font-semibold text-fg">
          {label}
        </label>
        {trailing}
      </div>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required
        className="mt-2 w-full rounded-xl border border-edge bg-card px-4 py-3 text-[15px] text-fg outline-none transition-all duration-200 placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/25"
      />
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
  pendingLabel,
}: {
  children: React.ReactNode;
  pending: boolean;
  pendingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-on-accent shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-ink disabled:pointer-events-none disabled:opacity-60"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

/** Error or success line under a form. */
export function FormNotice({ state }: { state: AuthState }) {
  if (!state?.error && !state?.message) return null;
  const isError = Boolean(state.error);
  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-xl border px-4 py-3 text-[14px] leading-relaxed ${
        isError ? "border-red-300 bg-red-50 text-red-800" : "border-accent/40 bg-accent/10 text-fg"
      }`}
    >
      {state.error ?? state.message}
    </p>
  );
}

export function AuthTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-[clamp(1.9rem,3.4vw,2.4rem)] font-extrabold leading-[1.06] text-fg">
      {children}
    </h1>
  );
}
