"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountIcon } from "../account/account-links";

const LINKS = [
  { label: "Overview", href: "/admin", icon: ["M4 13h6V4H4v9zM14 20h6V11h-6v9zM4 20h6v-4H4v4zM14 4v4h6V4h-6z"] },
  { label: "Analytics", href: "/admin/analytics", icon: ["M4 20V10M10 20V4M16 20v-7M22 20H2"] },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: ["M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 17.5v-11z", "M10 9l5 3-5 3V9z"],
  },
  {
    label: "Members",
    href: "/admin/members",
    icon: ["M9 11a4 4 0 100-8 4 4 0 000 8z", "M2 21a7 7 0 0114 0M16 3.5a4 4 0 010 7.5M18 14a6 6 0 014 7"],
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ["M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z", "M3 10h18M7 15h3"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: ["M6 16V11a6 6 0 1112 0v5l1.5 2h-15L6 16z", "M10 20.5a2 2 0 004 0"],
  },
];

/** Vertical section nav on desktop, a scrolling row of pills on phones. */
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="lg:sticky lg:top-[92px] lg:self-start">
      <p className="hidden px-3 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-neon lg:block">Admin</p>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-0.5 lg:px-0">
        {LINKS.map((link) => {
          const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2 text-[14px] font-medium transition-colors lg:rounded-lg lg:px-3 ${
                active
                  ? "bg-white/12 font-semibold text-white"
                  : "text-white/65 ring-1 ring-white/10 hover:bg-white/6 hover:text-white lg:ring-0"
              }`}
            >
              <AccountIcon paths={link.icon} className={`size-[18px] ${active ? "text-neon" : ""}`} />
              {link.label}
            </Link>
          );
        })}
        <Link
          href="/browse"
          className="mt-0 flex shrink-0 items-center gap-3 rounded-full px-4 py-2 text-[14px] font-medium text-white/45 ring-1 ring-white/10 transition-colors hover:text-white lg:mt-4 lg:rounded-lg lg:px-3 lg:ring-0"
        >
          ← Back to site
        </Link>
      </div>
    </nav>
  );
}
