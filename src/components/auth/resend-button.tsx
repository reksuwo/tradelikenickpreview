"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { resendConfirmation } from "@/lib/auth-actions";
import { FormNotice } from "./auth-ui";

/** Supabase allows one confirmation email per address every 60 seconds by default. */
const COOLDOWN_SECONDS = 60;

export function ResendButton() {
  const [state, resend, pending] = useActionState(resendConfirmation, undefined);
  const [secondsLeft, setSecondsLeft] = useState(COOLDOWN_SECONDS);

  // The first email was just sent, so start in cooldown and restart after each resend.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function handleClick() {
    startTransition(() => resend());
    setSecondsLeft(COOLDOWN_SECONDS);
  }

  const waiting = secondsLeft > 0;

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending || waiting}
        className="w-full rounded-full border border-edge bg-card px-6 py-3.5 text-[15px] font-bold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:border-fg/25 hover:shadow-card disabled:pointer-events-none disabled:opacity-55"
      >
        {pending ? "Sending…" : waiting ? `Resend email in ${secondsLeft}s` : "Resend email"}
      </button>
      <FormNotice state={state} />
    </div>
  );
}
