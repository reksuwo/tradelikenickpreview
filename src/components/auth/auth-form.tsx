"use client";

import { startTransition, useActionState } from "react";
import type { AuthState } from "@/lib/auth-actions";
import { FormNotice, SubmitButton } from "./auth-ui";

/** Runs an auth Server Action and shows its error or success message. */
export function AuthForm({
  action,
  next,
  submitLabel,
  pendingLabel,
  children,
}: {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
  submitLabel: string;
  pendingLabel: string;
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // Once a confirmation or reset email is on its way, the form has done its job.
  if (state?.message) {
    return (
      <div className="mt-8">
        <FormNotice state={state} />
      </div>
    );
  }

  // Submitting through onSubmit rather than <form action> stops React from
  // clearing the fields, so a failed attempt keeps what the person typed.
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {children}
      <FormNotice state={state} />
      <SubmitButton pending={pending} pendingLabel={pendingLabel}>
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
