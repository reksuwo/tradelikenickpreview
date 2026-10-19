"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useRef, type ReactNode } from "react";
import type { ActionState } from "@/lib/admin-actions";

/** Whether the surrounding ActionForm is waiting on its action. */
const Pending = createContext(false);

/**
 * Runs an admin Server Action and shows its result beside the form. Pass
 * `confirm` for anything destructive; the browser asks before it's sent.
 *
 * Submitting through onSubmit rather than <form action> stops React from
 * clearing the fields, so a rejected save keeps what was typed.
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
  const [state, formAction, pending] = useActionState(action, undefined);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resetOnSuccess && state?.message) form.current?.reset();
  }, [state, resetOnSuccess]);

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault();
        if (pending || (confirm && !window.confirm(confirm))) return;
        const data = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
        startTransition(() => formAction(data));
      }}
      className={className}
    >
      <Pending.Provider value={pending}>{children}</Pending.Provider>
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
  const pending = useContext(Pending);
  return (
    <button type="submit" name={name} value={value} disabled={pending} className={className}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
