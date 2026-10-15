import Link from "next/link";
import type { ReactNode } from "react";

export type Tone = "light" | "dark";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Every section on the page goes through here. `tone` sets the theme class that
 * all the semantic colour tokens hang off, so a section flips from white/neon to
 * black/white by changing one prop in page.tsx.
 */
export function Section({
  id,
  tone,
  className = "",
  children,
}: {
  id?: string;
  tone: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`theme-${tone} scroll-mt-28 border-b border-edge bg-surface ${className}`}
    >
      {children}
    </section>
  );
}

export function CTA({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  /** primary = accent fill · outline = bordered · contrast = inverted fill */
  variant?: "primary" | "outline" | "contrast";
  size?: "md" | "lg";
  className?: string;
}) {
  const sizes = {
    md: "px-5 py-3 text-sm",
    lg: "px-7 py-4 text-[15px]",
  };
  const variants = {
    primary: "bg-accent text-on-accent shadow-glow hover:opacity-90",
    outline: "border border-edge bg-card text-fg hover:border-fg/25 hover:shadow-card",
    contrast: "bg-fg text-surface hover:opacity-90",
  };
  return (
    <Link
      href={href}
      className={`group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent-ink ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
      &rarr;
    </span>
  );
}

export function SectionHeading({
  title,
  blurb,
  align = "center",
}: {
  title: ReactNode;
  blurb?: ReactNode;
  align?: "center" | "left";
}) {
  const isCenter = align === "center";
  return (
    <div
      className={`flex flex-col gap-5 ${
        isCenter ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <h2 className="max-w-3xl text-[clamp(2rem,4.4vw,3.35rem)] font-extrabold leading-[1.04] text-fg">
        {title}
      </h2>
      {blurb ? (
        <p className="max-w-2xl text-[17px] leading-relaxed text-muted">{blurb}</p>
      ) : null}
    </div>
  );
}

export function Highlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-[0.08em] h-[0.36em] -rotate-[0.7deg] bg-accent"
      />
      <span className="relative">{children}</span>
    </span>
  );
}

export function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={`size-4 shrink-0 ${className}`}>
      <path
        d="M4 10.6l4 3.9L16 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`size-4 ${className}`}>
      <path d="M8 5l11 7-11 7V5z" fill="currentColor" />
    </svg>
  );
}

export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={`size-4 ${className}`}>
      <path
        d="M10 1.6l2.5 5.4 5.9.7-4.3 4 1.1 5.8L10 14.8l-5.2 2.7 1.1-5.8-4.3-4 5.9-.7L10 1.6z"
        fill="currentColor"
      />
    </svg>
  );
}
