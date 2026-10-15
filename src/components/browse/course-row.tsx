"use client";

import { useRef } from "react";
import { Poster } from "../poster";
import { PlayIcon } from "../ui";
import type { Course } from "@/lib/courses";

export type RowItem = {
  course: Course;
  /** 0–1, shows a progress bar under the card (continue watching). */
  progress?: number;
  /** Small line under the card, e.g. "Lesson 12 of 148". */
  note?: string;
};

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-7">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Card({ item, rank, onOpen }: { item: RowItem; rank?: number; onOpen: () => void }) {
  const { course, progress, note } = item;

  return (
    <li className={`shrink-0 snap-start ${rank ? "flex w-[250px] items-end sm:w-[290px]" : "w-[240px] sm:w-[270px] lg:w-[300px]"}`}>
      {rank ? (
        <span
          aria-hidden
          className="-mr-4 font-display text-[150px] font-extrabold leading-[0.8] tracking-[-0.08em] text-black sm:text-[180px]"
          style={{ WebkitTextStroke: "3px rgba(255,255,255,0.55)" }}
        >
          {rank}
        </span>
      ) : null}

      <button
        type="button"
        onClick={onOpen}
        aria-label={`${course.title} — more info`}
        className={`group relative block w-full text-left ${rank ? "max-w-[140px] sm:max-w-[160px]" : ""}`}
      >
        <div
          className={`relative overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-300 group-hover:scale-[1.04] group-hover:ring-2 group-hover:ring-neon group-focus-visible:ring-2 group-focus-visible:ring-neon ${
            rank ? "aspect-[2/3]" : "aspect-video"
          }`}
        >
          <Poster variant={course.poster} label="" />

          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />

          {course.badge ? (
            <span className="absolute left-2.5 top-2.5 rounded bg-neon px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-ink">
              {course.badge}
            </span>
          ) : null}

          <p className="absolute inset-x-3 bottom-2.5 font-display text-[15px] font-extrabold leading-tight text-white">
            {course.title}
          </p>

          <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <span className="grid size-11 place-items-center rounded-full bg-white text-ink">
              <PlayIcon className="size-5 translate-x-0.5" />
            </span>
          </span>
        </div>

        {progress !== undefined ? (
          <div className="mx-auto mt-2 h-[3px] w-[88%] overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-neon" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        ) : null}
        {note ? <p className="mt-1.5 text-center text-[12px] font-medium text-white/55">{note}</p> : null}
      </button>
    </li>
  );
}

/** One horizontally scrolling shelf, with Netflix-style arrows on wide screens. */
export function CourseRow({
  id,
  title,
  items,
  ranked = false,
  onOpen,
}: {
  id?: string;
  title: string;
  items: RowItem[];
  ranked?: boolean;
  onOpen: (course: Course) => void;
}) {
  const scroller = useRef<HTMLUListElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <section id={id} className="group/row relative scroll-mt-24">
      <h2 className="px-4 text-[20px] font-bold text-white sm:px-8 sm:text-[22px] lg:px-[60px]">{title}</h2>

      <div className="relative mt-3">
        <ul
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 py-3 sm:scroll-px-8 sm:px-8 lg:scroll-px-[60px] lg:px-[60px]"
        >
          {items.map((item, i) => (
            <Card
              key={`${item.course.id}-${i}`}
              item={item}
              rank={ranked ? i + 1 : undefined}
              onOpen={() => onOpen(item.course)}
            />
          ))}
        </ul>

        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label={`Scroll ${title} left`}
          className="absolute inset-y-3 left-0 hidden w-[52px] place-items-center bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/75 group-hover/row:opacity-100 lg:grid"
        >
          <Chevron dir="left" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label={`Scroll ${title} right`}
          className="absolute inset-y-3 right-0 hidden w-[52px] place-items-center bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/75 group-hover/row:opacity-100 lg:grid"
        >
          <Chevron dir="right" />
        </button>
      </div>
    </section>
  );
}
