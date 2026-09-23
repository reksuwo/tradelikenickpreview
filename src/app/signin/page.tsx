import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Poster } from "@/components/poster";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Sign in — TradeLikeNick",
  description: "Sign in to watch your courses and pick up where you left off.",
};

const COLLAGE = COURSES.slice(0, 6);

function Field({
  label,
  type,
  name,
  placeholder,
  autoComplete,
  trailing,
}: {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  autoComplete: string;
  trailing?: React.ReactNode;
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
        className="mt-2 w-full rounded-xl border border-edge bg-card px-4 py-3 text-[15px] text-fg outline-none transition-all duration-200 placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/25"
      />
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="grid flex-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel — black with white highlights */}
      <div className="theme-dark relative hidden overflow-hidden bg-surface p-10 lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden className="dotgrid absolute inset-0 opacity-60" />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 top-1/3 size-[520px] rounded-full bg-accent/15 blur-[130px]"
        />

        <div className="relative">
          <Logo />
        </div>

        <div className="relative">
          <h2 className="max-w-md text-[clamp(1.9rem,2.6vw,2.6rem)] font-extrabold leading-[1.08] text-fg">
            Nine courses waiting, exactly where you left them.
          </h2>
          <p className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-muted">
            Sign in to watch, download for offline, and buy any course in the library from your
            account.
          </p>

          <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
            {COLLAGE.map((c) => (
              <div
                key={c.id}
                className="relative aspect-video overflow-hidden rounded-lg border border-edge"
              >
                <Poster variant={c.poster} label="" />
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-[13px] text-faint">
          <span>4,800+ members</span>
          <span className="size-1 rounded-full bg-edge" />
          <span>163 hours streaming</span>
          <span className="size-1 rounded-full bg-edge" />
          <span>4.9 average rating</span>
        </div>
      </div>

      {/* Form panel — white with neon highlights */}
      <div className="theme-light flex flex-col bg-surface px-5 py-10 sm:px-10">
        <div className="flex items-center justify-between gap-4">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-2 text-[13.5px] font-semibold text-muted transition-colors hover:text-fg"
          >
            <span aria-hidden>&larr;</span> Back to site
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-12">
          <h1 className="text-[clamp(1.9rem,3.4vw,2.4rem)] font-extrabold leading-[1.06] text-fg">
            Welcome back
          </h1>
          <p className="mt-3 text-[15.5px] text-muted">
            New here?{" "}
            <Link
              href="#"
              className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
            >
              Create an account
            </Link>{" "}
            and browse before you buy.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Google",
                path: "M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.7h5.4a4.6 4.6 0 01-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0012 22z M6.4 13.9a6 6 0 010-3.8V7.5H3.1a10 10 0 000 9l3.3-2.6z M12 5.9c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 003.1 7.5l3.3 2.6C7.2 7.7 9.4 5.9 12 5.9z",
              },
              {
                label: "Apple",
                path: "M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-2.9.9-3.7 2.3-1.6 2.7-.4 6.8 1.1 9 .8 1.1 1.7 2.3 2.9 2.2 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.2.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.5z M14.3 5.9c.6-.8 1.1-1.9 1-3-.9 0-2.1.6-2.8 1.4-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.5 2.8-1.3z",
              },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-edge bg-card px-4 py-3 text-[14.5px] font-semibold text-fg transition-all duration-200 hover:-translate-y-0.5 hover:border-fg/25 hover:shadow-card"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
                  <path d={p.path} fill="currentColor" />
                </svg>
                {p.label}
              </button>
            ))}
          </div>

          <div className="my-7 flex items-center gap-4">
            <span className="h-px flex-1 bg-edge" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-faint">
              or
            </span>
            <span className="h-px flex-1 bg-edge" />
          </div>

          <form className="space-y-5">
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              trailing={
                <Link
                  href="#"
                  className="text-[13px] font-semibold text-accent-ink transition-colors hover:text-fg"
                >
                  Forgot?
                </Link>
              }
            />

            <label className="flex items-center gap-2.5 text-[14px] text-muted">
              <input
                type="checkbox"
                name="remember"
                className="size-4 rounded border-edge accent-neon-deep"
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-accent px-6 py-3.5 text-[15px] font-bold text-on-accent shadow-glow transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-ink"
            >
              Sign in
            </button>
          </form>

          <p className="mt-7 text-[12.5px] leading-relaxed text-faint">
            By signing in you agree to the terms of service and privacy policy. Courses are
            educational material only and involve no guarantee of trading results.
          </p>
        </div>
      </div>
    </div>
  );
}
