"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, Container, PlayIcon, Section, Star, type Tone } from "./ui";
import { Poster } from "./poster";
import { CheckoutModal, courseCheckoutItem, type CheckoutItem } from "./checkout-modal";
import { categoriesOf, type Course } from "@/lib/courses";

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect
        x="5"
        y="10.5"
        width="14"
        height="10"
        rx="2.2"
        fill="currentColor"
      />
      <path
        d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CatalogCard({
  course,
  owned,
  watchHref,
  onBuy,
}: {
  course: Course;
  owned: boolean;
  watchHref: string;
  onBuy: () => void;
}) {
  const included = course.price === "Included";
  const canWatch = included || owned;

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border border-edge bg-card transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-card">
      <div className="relative aspect-video overflow-hidden border-b border-edge">
        <Poster variant={course.poster} label={course.category} labelInset />

        {course.badge ? (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-accent">
            {course.badge}
          </span>
        ) : null}

        {canWatch ? null : (
          <span
            title="Purchase to unlock"
            className="absolute bottom-3 left-3 grid size-8 place-items-center rounded-full bg-black/80 text-white backdrop-blur"
          >
            <LockIcon className="size-4" />
            <span className="sr-only">Locked — purchase to unlock</span>
          </span>
        )}

        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-bold tabnum text-white backdrop-blur">
          {course.hours}
        </span>

        <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid size-12 scale-90 place-items-center rounded-full bg-accent text-on-accent shadow-glow transition-transform duration-200 group-hover:scale-100">
            <PlayIcon className="size-5 translate-x-0.5" />
          </span>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
          <span className="text-accent-ink">{course.category}</span>
          <span className="size-1 rounded-full bg-edge" />
          <span>{course.level}</span>
        </div>
        <h3 className="mt-2 text-[18px] font-extrabold leading-snug text-fg">
          {course.title}
        </h3>
        <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-muted">
          {course.blurb}
        </p>

        <div className="mt-4 flex items-center gap-2 text-[12.5px] text-muted">
          <span className="flex items-center gap-1 font-semibold text-fg">
            <Star className="size-3.5 text-accent-ink" />
            {course.rating}
          </span>
          <span className="size-1 rounded-full bg-edge" />
          <span>{course.lessons}</span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-edge pt-5">
          {canWatch ? (
            <p className="font-display text-[22px] font-extrabold tabnum text-fg">
              {owned && !included ? "Owned" : course.price}
            </p>
          ) : (
            <button
              type="button"
              onClick={onBuy}
              aria-label={`Buy ${course.title} for ${course.price}`}
              className="font-display text-[22px] font-extrabold tabnum text-fg underline-offset-4 transition-colors hover:text-accent-ink hover:underline"
            >
              {course.price}
            </button>
          )}
          {canWatch ? (
            <Link
              href={watchHref}
              className="inline-flex items-center gap-1.5 rounded-full bg-chip px-4 py-2.5 text-[13.5px] font-semibold text-on-chip transition-opacity hover:opacity-85"
            >
              Start watching <Arrow />
            </Link>
          ) : (
            <button
              type="button"
              onClick={onBuy}
              className="inline-flex items-center gap-1.5 rounded-full bg-chip px-4 py-2.5 text-[13.5px] font-semibold text-on-chip transition-opacity hover:opacity-85"
            >
              Unlock course <Arrow />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/**
 * Pass `owned` on member pages (course ids from getLibrary): "Start watching"
 * then opens the player. Visitors, with no `owned`, are sent to sign in.
 */
export function CourseCatalog({ tone, courses, owned }: { tone: Tone; courses: Course[]; owned?: string[] }) {
  const [active, setActive] = useState("All");
  const [buying, setBuying] = useState<CheckoutItem | null>(null);
  const shown =
    active === "All" ? courses : courses.filter((c) => c.category === active);

  return (
    <Section id="all-courses" tone={tone} className="py-20 lg:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.05] text-fg">
              All courses
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              {shown.length} {shown.length === 1 ? "course" : "courses"}
              {active === "All" ? "" : ` in ${active}`}
            </p>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {categoriesOf(courses).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-all duration-200 ${
                  active === c
                    ? "border-transparent bg-chip text-on-chip"
                    : "border-edge bg-card text-muted hover:border-fg/30 hover:text-fg"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((c) => (
            <CatalogCard
              key={c.id}
              course={c}
              owned={owned?.includes(c.id) ?? false}
              watchHref={owned ? `/browse/watch/${c.id}` : "/signin"}
              onBuy={() => setBuying(courseCheckoutItem(c))}
            />
          ))}
        </div>
      </Container>

      <CheckoutModal item={buying} onClose={() => setBuying(null)} />
    </Section>
  );
}
