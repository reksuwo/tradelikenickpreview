"use client";

import { startTransition, useActionState } from "react";
import type { AuthState } from "@/lib/auth-actions";

type FormState = (AuthState & { savedAt?: number }) | undefined;

/**
 * Runs an account Server Action and shows its result inline. Unlike AuthForm
 * the form stays put after success; its fields remount so they show the saved
 * values (or clear, for passwords).
 */
export function AccountForm({
  action,
  submitLabel,
  pendingLabel,
  children,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prev, formData) => {
    const result = await action(prev, formData);
    return result?.message ? { ...result, savedAt: Date.now() } : result;
  }, undefined);

  // onSubmit rather than <form action> so a failed attempt keeps what was typed.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div key={state?.savedAt ?? 0} className="space-y-5">
        {children}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-ink transition-colors hover:bg-white/85 disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        {state?.error ? (
          <p role="alert" className="text-[14px] font-medium text-red-300">
            {state.error}
          </p>
        ) : state?.message ? (
          <p role="status" className="flex items-center gap-1.5 text-[14px] font-medium text-neon">
            <svg viewBox="0 0 12 12" aria-hidden className="size-3.5">
              <path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}

const INPUT =
  "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none transition-all placeholder:text-white/35 focus:border-white/60 focus:ring-4 focus:ring-white/10 read-only:cursor-not-allowed read-only:text-white/55 read-only:focus:border-white/15 read-only:focus:ring-0";

export function AccountField({
  label,
  name,
  defaultValue,
  readOnly,
  hint,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  readOnly?: boolean;
  hint?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-[13.5px] font-semibold text-white">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        readOnly={readOnly}
        autoComplete={autoComplete}
        required={!readOnly}
        className={INPUT}
      />
      {hint ? <p className="mt-1.5 text-[13px] text-white/45">{hint}</p> : null}
    </div>
  );
}
