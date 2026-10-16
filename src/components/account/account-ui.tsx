import Link from "next/link";
import type { ReactNode } from "react";
import { AccountIcon } from "./account-links";

export function PageHeading({ title, intro }: { title: string; intro?: ReactNode }) {
  return (
    <div className="mb-8">
      <h1 className="text-[clamp(1.7rem,3vw,2.2rem)] font-extrabold leading-tight text-white">{title}</h1>
      {intro ? <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/60">{intro}</p> : null}
    </div>
  );
}

/** A titled card; settings and profile pages stack several of these. */
export function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <h2 className="text-[17px] font-bold text-white">{title}</h2>
      {description ? <p className="mt-1 text-[14px] leading-relaxed text-white/55">{description}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  cta,
}: {
  icon: string[];
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/15 px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-white/6 text-neon">
        <AccountIcon paths={icon} className="size-7" />
      </span>
      <h2 className="mt-5 text-[18px] font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-white/55">{body}</p>
      <Link
        href={cta.href}
        className="mt-6 rounded-full bg-white px-6 py-2.5 text-[14px] font-bold text-ink transition-colors hover:bg-white/85"
      >
        {cta.label}
      </Link>
    </div>
  );
}
