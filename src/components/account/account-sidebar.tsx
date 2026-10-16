"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACCOUNT_GROUPS, AccountIcon } from "./account-links";

/** Vertical section nav on desktop, a scrolling row of pills on phones. */
export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-[92px] lg:self-start">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-6 lg:px-0">
        {ACCOUNT_GROUPS.map((group) => (
          <div key={group.title} className="flex shrink-0 gap-2 lg:flex-col lg:gap-0.5">
            <p className="hidden px-3 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.14em] text-white/40 lg:block">
              {group.title}
            </p>
            {group.links.map((link) => {
              const active = pathname === link.href;
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
          </div>
        ))}
      </div>
    </nav>
  );
}
