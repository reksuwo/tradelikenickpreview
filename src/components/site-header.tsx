"use client";

import Link from "next/link";
import { useState } from "react";
import { Container, CTA } from "./ui";
import { Logo } from "./logo";

const NAV = [
  { label: "Library", href: "/#library" },
  { label: "How it works", href: "/#how" },
  { label: "Courses", href: "/courses" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Trading Books", href: "/books" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="theme-dark bg-surface">
        <Container className="flex h-9 items-center justify-center gap-2 text-center text-[12.5px] font-medium text-muted">
          <span className="size-1.5 shrink-0 animate-pulse-dot rounded-full bg-accent" />
          <span className="truncate">
            New episode every Thursday &mdash;{" "}
            <span className="font-semibold text-fg">Trading Live With Nick</span>
          </span>
        </Container>
      </div>

      <div className="border-b border-line bg-white/85 backdrop-blur-xl">
        <Container className="flex h-[68px] items-center justify-between gap-4">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[14.5px] font-medium text-ink-700 transition-colors hover:bg-mist hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 sm:flex">
            <Link
              href="/#faq"
              className="rounded-full px-4 py-2 text-[14.5px] font-semibold text-ink-700 transition-colors hover:text-ink"
            >
              Questions?
            </Link>
            <Link
              href="/signin"
              className="rounded-full px-4 py-2 text-[14.5px] font-semibold text-ink-700 transition-colors hover:text-ink"
            >
              Sign in
            </Link>
            <CTA href="/signup">Sign up free</CTA>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="grid size-10 place-items-center rounded-xl border border-line text-ink lg:hidden"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </Container>

        {open ? (
          <div className="border-t border-line bg-white lg:hidden">
            <Container className="flex flex-col gap-1 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-ink-700 hover:bg-mist"
                >
                  {item.label}
                </Link>
              ))}
              <CTA href="/signup" size="lg" className="mt-2 w-full">
                Sign up free
              </CTA>
              <CTA href="/signin" variant="outline" size="lg" className="w-full">
                Sign in
              </CTA>
            </Container>
          </div>
        ) : null}
      </div>
    </header>
  );
}
