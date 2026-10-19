import Link from "next/link";
import type { ReactNode } from "react";

// ─── Formatting ───────────────────────────────────────────────────────

/** 69700 → "$697", 2450 → "$24.50". */
export function money(cents: number, currency = "usd") {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/** 1284 → "1,284", 12900 → "12.9K". */
export function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: n >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}

export function date(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function dateTime(value: Date | string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

/** "3 hrs ago", "2 days ago". */
export function ago(value: Date | string | null) {
  if (!value) return "Never";
  const minutes = Math.round((Date.now() - new Date(value).getTime()) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date(value);
}

/** Watch time: "42 min", "12.5 hrs". */
export function watchTime(seconds: number) {
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  const hours = seconds / 3600;
  return `${hours < 100 ? hours.toFixed(1) : compact(Math.round(hours))} hrs`;
}

export function percent(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "—";
}

// ─── Layout ───────────────────────────────────────────────────────────

export function AdminHeading({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold leading-tight text-white">{title}</h1>
        {intro ? <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/60">{intro}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  flush = false,
}: {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  /** No inner padding, for tables that run edge to edge. */
  flush?: boolean;
}) {
  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.03]">
      {title ? (
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-[16px] font-bold text-white">{title}</h2>
            {description ? <p className="mt-0.5 text-[13.5px] leading-relaxed text-white/50">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={flush ? "mt-4" : `px-5 pb-5 sm:px-6 sm:pb-6 ${title ? "mt-4" : "pt-5 sm:pt-6"}`}>{children}</div>
    </section>
  );
}

/** A headline number with an optional comparison. */
export function StatTile({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  /** Change vs the previous period, as a fraction (0.12 = +12%). Up is good. */
  delta?: number | null;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[13px] font-semibold text-white/55">{label}</p>
      <p className="mt-2 text-[28px] font-bold leading-none text-white">{value}</p>
      {delta != null && Number.isFinite(delta) ? (
        <p className={`mt-2 text-[12.5px] font-semibold ${delta >= 0 ? "text-neon" : "text-[#ff8a7a]"}`}>
          <span aria-hidden>{delta >= 0 ? "▲" : "▼"}</span> {Math.abs(Math.round(delta * 100))}%{" "}
          <span className="font-medium text-white/45">vs previous 30 days</span>
        </p>
      ) : hint ? (
        <p className="mt-2 text-[12.5px] text-white/45">{hint}</p>
      ) : null}
    </div>
  );
}

const BADGE_TONES = {
  good: "bg-neon/15 text-neon",
  warn: "bg-[#ffb547]/15 text-[#ffc670]",
  bad: "bg-[#ff6b5a]/15 text-[#ff9384]",
  muted: "bg-white/10 text-white/70",
};

export function Badge({ tone = "muted", children }: { tone?: keyof typeof BADGE_TONES; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11.5px] font-bold ${BADGE_TONES[tone]}`}>
      {children}
    </span>
  );
}

/** A thin progress meter: neon fill on a dim track, with the value written beside it. */
export function Meter({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <span className="flex items-center gap-2.5">
      <span className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full bg-neon" style={{ width: `${clamped}%` }} />
      </span>
      <span className="w-10 shrink-0 text-right text-[12.5px] font-semibold tabnum text-white/70">{label ?? `${Math.round(clamped)}%`}</span>
    </span>
  );
}

// ─── Tables ───────────────────────────────────────────────────────────

export const TABLE = "w-full min-w-[640px] border-collapse text-left text-[14px]";
export const TH = "border-b border-white/10 px-5 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.1em] text-white/45 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6";
export const TD = "border-b border-white/[0.06] px-5 py-3 align-middle text-white/80 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6";

export function TableWrap({ children }: { children: ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 py-10 text-center text-[14px] text-white/50 sm:px-6">{children}</p>;
}

/** Builds a link to the same page with some search params changed. */
export function withParams(base: string, params: Record<string, string | number | undefined>, changes: Record<string, string | number | undefined>) {
  const merged = { ...params, ...changes };
  const query = new URLSearchParams(
    Object.entries(merged).flatMap(([k, v]) => (v === undefined || v === "" || (k === "page" && v === 1) ? [] : [[k, String(v)]])),
  ).toString();
  return query ? `${base}?${query}` : base;
}

export function Pagination({
  base,
  params,
  page,
  total,
  pageSize,
}: {
  base: string;
  params: Record<string, string | number | undefined>;
  page: number;
  total: number;
  pageSize: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = "rounded-full px-4 py-2 text-[13.5px] font-semibold ring-1 ring-white/15 transition-colors hover:bg-white/10";
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 text-[13.5px] text-white/55 sm:px-6">
      <span className="tabnum">
        {total ? `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total.toLocaleString()}` : "0 results"}
      </span>
      <span className="flex gap-2">
        {page > 1 ? (
          <Link href={withParams(base, params, { page: page - 1 })} className={link}>
            ← Previous
          </Link>
        ) : null}
        {page < pages ? (
          <Link href={withParams(base, params, { page: page + 1 })} className={link}>
            Next →
          </Link>
        ) : null}
      </span>
    </div>
  );
}

/** A row of links that set one search param, like a segmented control. */
export function Segmented({
  base,
  params,
  name,
  options,
  value,
}: {
  base: string;
  params: Record<string, string | number | undefined>;
  name: string;
  options: { value: string; label: string }[];
  value: string;
}) {
  return (
    <div className="inline-flex rounded-full bg-white/[0.06] p-1 ring-1 ring-white/10">
      {options.map((o) => (
        <Link
          key={o.value}
          href={withParams(base, params, { [name]: o.value, page: undefined })}
          aria-current={o.value === value ? "true" : undefined}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors ${
            o.value === value ? "bg-white text-ink" : "text-white/65 hover:text-white"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}

export const INPUT =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-[14.5px] text-white placeholder:text-white/35 outline-none transition-colors focus:border-neon/70 focus:bg-white/[0.06]";

/**
 * Native selects open a menu the OS draws. Dark color-scheme and option colours
 * keep it from showing white text on a white menu.
 */
export const SELECT = `${INPUT} bg-[#121514] [color-scheme:dark] [&_option]:bg-[#121514] [&_option]:text-white [&_optgroup]:bg-[#121514] [&_optgroup]:text-white/60`;

export const LABEL ="mb-1.5 block text-[13px] font-semibold text-white/70";

export const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-full bg-neon px-5 py-2.5 text-[14px] font-bold text-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";

export const BUTTON_QUIET =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold text-white/80 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50";

export const BUTTON_DANGER =
  "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-semibold text-[#ff9384] ring-1 ring-[#ff6b5a]/40 transition-colors hover:bg-[#ff6b5a]/10 disabled:cursor-not-allowed disabled:opacity-50";

/** A GET search box that keeps the page's other filters. */
export function SearchBox({
  base,
  params,
  placeholder,
}: {
  base: string;
  params: Record<string, string | number | undefined>;
  placeholder: string;
}) {
  return (
    <form action={base} className="flex w-full max-w-md gap-2">
      {Object.entries(params).map(([k, v]) =>
        k !== "q" && k !== "page" && v !== undefined && v !== "" ? <input key={k} type="hidden" name={k} value={v} /> : null,
      )}
      <input type="search" name="q" defaultValue={params.q} placeholder={placeholder} aria-label={placeholder} className={INPUT} />
      <button type="submit" className={BUTTON_QUIET}>
        Search
      </button>
    </form>
  );
}
