"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Eyebrow, PlayIcon, Section, Star, type Tone } from "./ui";
import { Poster } from "./poster";
import { CATEGORIES, COURSES, ROWS, byId, type Course } from "@/lib/courses";

const TRACK_PADDING = "px-5 sm:px-8 lg:px-[max(2rem,calc((100vw_-_1180px)_/_2))]";

function CourseCard({ course }: { course: Course }) {
  return (
    <article data-card className="group w-[248px] shrink-0 snap-start sm:w-[284px]">
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-edge transition-all duration-200 group-hover:border-accent group-hover:shadow-card">
        <Poster variant={course.poster} label={course.category} />

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

function Row({
  title,
  subtitle,
  courses,
}: {
  title: string;
  subtitle: string;
  courses: Course[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(max <= 4 || el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [sync, courses.length]);

  const step = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  return (
    <div>
      <Container className="flex items-end justify-between gap-6">
        <div>
          <h3 className="text-[19px] font-extrabold text-fg sm:text-[22px]">{title}</h3>
          <p className="mt-1 text-[13.5px] text-muted">{subtitle}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={atStart}
            aria-label={`Scroll ${title} left`}
            className="grid size-10 place-items-center rounded-full border border-edge bg-card text-fg transition-all duration-200 hover:border-fg/40 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-4">
              <path
                d="M14.5 5.5L8 12l6.5 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={atEnd}
            aria-label={`Scroll ${title} right`}
            className="grid size-10 place-items-center rounded-full bg-chip text-on-chip transition-all duration-200 hover:opacity-85 disabled:pointer-events-none disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-4">
              <path
                d="M9.5 5.5L16 12l-6.5 6.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </Container>

      <div
        ref={trackRef}
        onScroll={sync}
        tabIndex={0}
        role="region"
        aria-label={title}
        className={`no-scrollbar mt-5 flex snap-x gap-4 overflow-x-auto pb-2 focus-visible:outline-none ${TRACK_PADDING}`}
      >
        {courses.map((c) => (
          <CourseCard key={`${title}-${c.id}`} course={c} />
        ))}
      </div>
    </div>
  );
}

export function Library({ tone }: { tone: Tone }) {
  const [active, setActive] = useState("All");
  const filtered = COURSES.filter((c) => c.category === active);

  return (
    <Section id="library" tone={tone} className="overflow-hidden py-20 lg:py-28">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>The library</Eyebrow>
          <h2 className="mt-5 text-[clamp(2rem,4.2vw,3.1rem)] font-extrabold leading-[1.04] text-fg">
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
      </Container>

      <div className="mt-12 space-y-14">
        {active === "All" ? (
          ROWS.map((row) => (
            <Row
              key={row.title}
              title={row.title}
              subtitle={row.subtitle}
              courses={row.ids.map(byId)}
            />
          ))
        ) : (
          <Row
            title={active}
            subtitle={`${filtered.length} ${filtered.length === 1 ? "course" : "courses"} in this category`}
            courses={filtered}
          />
        )}
      </div>
    </Section>
  );
}
