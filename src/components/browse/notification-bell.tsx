"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { openNotifications } from "@/lib/notification-actions";
import type { Notification, NotificationKind } from "@/lib/notifications";

const KIND_ICON: Record<NotificationKind, string> = {
  purchase: "M5 12.5l4.5 4.5L19 7.5",
  course: "M8 5.5v13l10.5-6.5L8 5.5z",
  live: "M12 9.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM6.3 6.3a8 8 0 000 11.4M17.7 6.3a8 8 0 010 11.4",
  announcement: "M4 10v4h3l6 4V6L7 10H4zM16.5 9a4 4 0 010 6",
};

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

/** "5 minutes ago", "yesterday", … */
function timeAgo(iso: string) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000;
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return format.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

export function NotificationBell({ initial }: { initial: Notification[] }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(() => initial.filter((n) => n.unread).length);
  const [loading, startLoading] = useTransition();
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

  const toggle = () => {
    const opening = !open;
    setOpen(opening);
    if (!opening) return;
    // Fetch fresh and mark seen. Items keep their unread dot until the next open.
    setUnread(0);
    startLoading(async () => {
      try {
        setItems(await openNotifications());
      } catch {
        // Keep showing what we had.
      }
    });
  };

  const close = () => setOpen(false);

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} new` : "Notifications"}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={toggle}
        className="relative grid size-10 place-items-center rounded-full text-white transition-colors hover:bg-white/10 aria-expanded:bg-white/10"
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
        {unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-neon px-1 text-[10px] font-extrabold text-ink">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <div
        id="notification-panel"
        className={`absolute -right-14 top-full mt-3 w-[min(360px,calc(100vw-32px))] origin-top-right overflow-hidden rounded-2xl border border-white/12 bg-[#121514] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.95)] transition duration-150 ease-out sm:right-0 ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <p className="text-[15px] font-bold text-white">Notifications</p>
          {loading && <span className="text-[12px] text-white/40">Updating…</span>}
        </div>

        {/* Rendered only while open, so relative times are computed on the client. */}
        {open &&
          (items.length === 0 ? (
            <p className="px-4 py-10 text-center text-[14px] text-white/50">
              You&apos;re all caught up. New courses, live sessions and purchases show up here.
            </p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto py-1.5">
              {items.map((n) => {
                const content = (
                  <>
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/8 text-neon">
                      <svg viewBox="0 0 24 24" aria-hidden className="size-4">
                        <path
                          d={KIND_ICON[n.kind]}
                          fill={n.kind === "course" ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-semibold leading-snug text-white">{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-[13px] leading-snug text-white/55">{n.body}</span>}
                      <span className="mt-1 block text-[12px] text-white/35">{timeAgo(n.createdAt)}</span>
                    </span>
                    {n.unread && <span aria-label="New" className="mt-2 size-2 shrink-0 rounded-full bg-neon" />}
                  </>
                );
                const row = "mx-1.5 flex gap-3 rounded-lg px-3 py-2.5";
                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link
                        href={n.href}
                        onClick={close}
                        className={`${row} outline-none transition-colors hover:bg-white/5 focus-visible:bg-white/5`}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className={row}>{content}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          ))}
      </div>
    </div>
  );
}
