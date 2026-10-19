"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/admin-actions";

/**
 * Runs an admin Server Action and shows its result beside the form. Pass
 * `confirm` for anything destructive; the browser asks before it's sent.
 */
export function ActionForm({
  action,
  confirm,
  resetOnSuccess = false,
  className = "",
  noticeClassName = "",
  children,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  confirm?: string;
  resetOnSuccess?: boolean;
  className?: string;
  noticeClassName?: string;
  children: ReactNode;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.message) form.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={form}
      action={formAction}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={className}
    >
      {children}
      {state?.error || state?.message ? (
        <p
          role={state.error ? "alert" : "status"}
          className={`text-[13px] font-semibold ${state.error ? "text-[#ff9384]" : "text-neon"} ${noticeClassName}`}
        >
          {state.error ?? state.message}
        </p>
      ) : null}
    </form>
  );
}

/** A submit button that disables itself and swaps its label while the action runs. */
export function Submit({
  children,
  pending: pendingLabel,
  className,
  name,
  value,
}: {
  children: ReactNode;
  pending?: string;
  className: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={className}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
