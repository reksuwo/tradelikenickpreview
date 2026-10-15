"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, Container, CTA, PlayIcon, Section, Star, type Tone } from "./ui";
import { Poster } from "./poster";
import { CATEGORIES, COURSES, ROWS, byId, type Course } from "@/lib/courses";

function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-edge transition-all duration-200 group-hover:border-accent group-hover:shadow-card">
        <Poster variant={course.poster} label={course.category} labelInset />

        <span
          title="Purchase to unlock"
          className="absolute bottom-3 left-3 grid size-8 place-items-center rounded-full bg-black/80 text-white backdrop-blur"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-4">
            <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor" />
            <path
              d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          <span className="sr-only">Locked — purchase to unlock</span>
        </span>

        {course.badge ? (
          <span className="absolute left-3 top-3 rounded-md bg-accent px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-on-accent">
            {course.badge}
          </span>
        ) : null}

        <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-bold tabnum text-white backdrop-blur">
          {course.hours}
        </span>

        <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="grid size-12 scale-90 place-items-center rounded-full bg-accent text-on-accent shadow-glow transition-transform duration-200 group-hover:scale-100">
            <PlayIcon className="size-5 translate-x-0.5" />
          </span>
        </span>
      </div>

      <div className="mt-3.5 px-0.5">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-faint">
          <span className="text-accent-ink">{course.category}</span>
          <span className="size-1 rounded-full bg-edge" />
          <span>{course.level}</span>
        </div>
        <h4 className="mt-1.5 text-[15.5px] font-bold leading-snug text-fg">
          <Link href="/signin" className="transition-opacity hover:opacity-70">
            {course.title}
          </Link>
        </h4>
        <div className="mt-2 flex items-center gap-2 text-[12.5px] text-muted">
          <span className="flex items-center gap-1 font-semibold text-fg">
            <Star className="size-3.5 text-accent-ink" />
            {course.rating}
          </span>
          <span className="size-1 rounded-full bg-edge" />
          <span>{course.lessons}</span>
        </div>
      </div>
    </article>
  );
}

const HOME_LIMIT = 4;

export function Library({ tone }: { tone: Tone }) {
  const [active, setActive] = useState("All");
  const courses = (
    active === "All" ? ROWS[0].ids.map(byId) : COURSES.filter((c) => c.category === active)
  ).slice(0, HOME_LIMIT);

  return (
    <Section id="library" tone={tone} className="py-20 lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-[clamp(2rem,4.2vw,3.1rem)] font-extrabold leading-[1.04] text-fg">
            Nine courses. One shelf. Watch in any order.
          </h2>
          <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
            Browse everything without an account. Sign in to watch the opening episodes free, and
            buy whichever titles you want from inside your library.
          </p>
        </div>

        <div className="no-scrollbar mt-9 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
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

        <div className="mt-12">
          <h3 className="text-[19px] font-extrabold text-fg sm:text-[22px]">
            {active === "All" ? ROWS[0].title : active}
          </h3>
          <p className="mt-1 text-[13.5px] text-muted">
            {active === "All" ? ROWS[0].subtitle : "A few picks from this category"}
          </p>
        </div>

        <div className="mt-5 grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {courses.map((c) => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <CTA href="/courses" size="lg">
            View all courses <Arrow />
          </CTA>
        </div>
      </Container>
    </Section>
  );
}
