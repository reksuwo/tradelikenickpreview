import Link from "next/link";
import { Logo } from "@/components/logo";
import { Poster } from "@/components/poster";
import { COURSES } from "@/lib/courses";
import { AuthTitle } from "./auth-ui";

const COLLAGE = COURSES.slice(0, 6);

/** Two-panel layout shared by sign-in, sign-up and password pages. */
export function AuthShell({
  title,
  intro,
  children,
}: {
  /** Omit to let `children` render their own heading. */
  title?: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
}) {
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
          {title ? <AuthTitle>{title}</AuthTitle> : null}
          {intro ? <p className="mt-3 text-[15.5px] text-muted">{intro}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
    >
      {children}
    </Link>
  );
}
