"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../logo";

const NAV = [
  { label: "Home", href: "/browse" },
  { label: "My Courses", href: "/browse#continue" },
  { label: "Live", href: "/browse#live" },
  { label: "New & Popular", href: "/browse#popular" },
  { label: "All Courses", href: "/courses" },
];

/** App bar for signed-in members. Transparent over the hero, solid once you scroll. */
export function BrowseHeader({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-black/95 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)] backdrop-blur" : "bg-transparent"
      }`}
    >
      <div className="flex h-[68px] items-center gap-6 px-4 sm:px-8 lg:px-[60px]">
        <Logo />

        <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex">
          {NAV.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                i === 0 ? "bg-white/15 font-bold text-white" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            aria-label="Search courses"
            className="grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-[22px]">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            aria-label="Notifications, 2 new"
            className="relative grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-[22px]">
              <path
                d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16zM10 20.5a2 2 0 004 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-neon text-[10px] font-extrabold text-ink">
              2
            </span>
          </button>

          <button
            type="button"
            aria-label="Account menu"
            className="flex items-center gap-1.5 rounded-xl p-1 ring-1 ring-white/20 transition-colors hover:ring-white/60"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-neon font-display text-[14px] font-extrabold text-ink">
              {name.charAt(0)}
            </span>
            <svg viewBox="0 0 12 12" aria-hidden className="mr-1 size-2.5 text-white">
              <path d="M2 4l4 4 4-4" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
