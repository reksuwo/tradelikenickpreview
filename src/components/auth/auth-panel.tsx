"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-actions";
import { AuthForm } from "./auth-form";
import { AuthTitle, Field } from "./auth-ui";
import { PasswordField } from "./password-field";

export type AuthMode = "signin" | "signup";

const COPY = {
  signin: {
    tab: "Sign in",
    title: "Welcome back",
    prompt: "New here?",
    switchLabel: "Create an account",
    switchTail: " and browse before you buy.",
    submit: "Sign in",
    pending: "Signing in…",
    legal: "By signing in",
  },
  signup: {
    tab: "Create account",
    title: "Create your account",
    prompt: "Already a member?",
    switchLabel: "Sign in",
    switchTail: "",
    submit: "Create account",
    pending: "Creating account…",
    legal: "By creating an account",
  },
} as const;

/**
 * Sign-in and sign-up on one page. The tabs switch forms instantly and keep
 * the address in step, so /signin and /signup both open the right tab.
 */
export function AuthPanel({
  initialMode,
  next,
  social,
  error,
}: {
  initialMode: AuthMode;
  next: string;
  /** Social sign-in buttons, rendered on the server. */
  social: React.ReactNode;
  /** Message from a failed email link or social sign-in. */
  error?: string;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const copy = COPY[mode];
  const other: AuthMode = mode === "signin" ? "signup" : "signin";

  function switchTo(target: AuthMode) {
    setMode(target);
    const query = next === "/browse" ? "" : `?next=${encodeURIComponent(next)}`;
    window.history.replaceState(null, "", `/${target}${query}`);
  }

  return (
    <>
      <div role="tablist" aria-label="Account" className="mb-9 grid grid-cols-2 rounded-full border border-edge bg-card p-1">
        {(["signin", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchTo(m)}
            className={`rounded-full px-4 py-2.5 text-[14px] font-semibold transition-all duration-200 ${
              mode === m ? "bg-fg text-surface shadow-card" : "text-muted hover:text-fg"
            }`}
          >
            {COPY[m].tab}
          </button>
        ))}
      </div>

      <AuthTitle>{copy.title}</AuthTitle>
      <p className="mt-3 text-[15.5px] text-muted">
        {copy.prompt}{" "}
        <button
          type="button"
          onClick={() => switchTo(other)}
          className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
        >
          {copy.switchLabel}
        </button>
        {copy.switchTail}
      </p>

      {social}

      {error && mode === "signin" ? (
        <p role="alert" className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[14px] text-red-800">
          {error}
        </p>
      ) : null}

      {mode === "signin" ? (
        <AuthForm key="signin" action={signIn} next={next} submitLabel={copy.submit} pendingLabel={copy.pending}>
          <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            trailing={
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-accent-ink transition-colors hover:text-fg"
              >
                Forgot?
              </Link>
            }
          />
        </AuthForm>
      ) : (
        <AuthForm key="signup" action={signUp} next={next} submitLabel={copy.submit} pendingLabel={copy.pending}>
          <Field label="Name" name="name" type="text" placeholder="Your name" autoComplete="name" />
          <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
          <PasswordField />
        </AuthForm>
      )}

      <p className="mt-7 text-[12.5px] leading-relaxed text-faint">
        {copy.legal} you agree to the terms of service and privacy policy. Courses are educational
        material only and involve no guarantee of trading results.
      </p>
    </>
  );
}
