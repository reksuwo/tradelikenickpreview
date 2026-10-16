"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "../logo";
import { ACCOUNT_GROUPS, AccountIcon, SIGN_OUT_ICON } from "../account/account-links";
import { Avatar } from "../account/avatar";
import { signOut } from "@/lib/auth-actions";
import type { Member } from "@/lib/member";

const NAV = [
  { label: "Home", href: "/browse" },
  { label: "My Courses", href: "/account/courses" },
  { label: "Live", href: "/browse/live" },
  { label: "New & Popular", href: "/browse/popular" },
  { label: "All Courses", href: "/browse/courses" },
  { label: "Books", href: "/browse/books" },
];

const MENU_ITEM =
  "mx-1.5 flex w-[calc(100%-12px)] items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] font-medium text-white/80 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:bg-white/10 focus-visible:text-white";

function AccountMenu({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label="Account menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-xl p-1 ring-1 ring-white/20 transition-colors hover:ring-white/60 aria-expanded:ring-white/60"
      >
        <Avatar name={member.fullName} src={member.avatarUrl} />
        <svg
          viewBox="0 0 12 12"
          aria-hidden
          className={`mr-1 size-2.5 text-white transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" fill="currentColor" />
        </svg>
      </button>

      <div
        id="account-menu"
        className={`absolute right-0 top-full mt-3 w-[280px] origin-top-right overflow-hidden rounded-2xl border border-white/12 bg-[#121514] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)] transition duration-150 ease-out ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <Link
          href="/account/profile"
          onClick={close}
          className="flex items-center gap-3 px-4 py-4 outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5"
        >
          <Avatar name={member.fullName} src={member.avatarUrl} className="size-11 rounded-xl text-[16px]" />
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold text-white">{member.fullName}</span>
            <span className="block truncate text-[13px] text-white/55">{member.email}</span>
          </span>
        </Link>

        {ACCOUNT_GROUPS.map((group) => (
          <div key={group.title} className="border-t border-white/10 py-1.5">
            {group.links.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className={MENU_ITEM}>
                <AccountIcon paths={link.icon} className="size-[18px] text-white/50" />
                {link.label}
              </Link>
            ))}
          </div>
        ))}

        <form action={signOut} className="border-t border-white/10 py-1.5">
          <button type="submit" className={MENU_ITEM}>
            <AccountIcon paths={SIGN_OUT_ICON} className="size-[18px] text-white/50" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}

/** App bar for signed-in members. Transparent over the hero, solid once you scroll. */
export function BrowseHeader({ member }: { member: Member }) {
  const pathname = usePathname();
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
        <Logo href="/browse" />

        <nav className="no-scrollbar hidden items-center gap-1 overflow-x-auto md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                  active ? "bg-white/15 font-bold text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
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

          <AccountMenu member={member} />
        </div>
      </div>
    </header>
  );
}
