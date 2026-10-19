"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Poster } from "../poster";
import { PlayIcon, Star } from "../ui";
import type { Course } from "@/lib/courses";
import { clockTime, minutes, type Lecture } from "@/lib/lectures";

function Episodes({ courseId, lectures, owned }: { courseId: string; lectures: Lecture[]; owned: boolean }) {
  return (
    <div className="border-t border-white/10 px-6 pb-8 pt-6 sm:px-10">
      <h3 className="text-[20px] font-bold">Episodes</h3>
      <ol className="mt-4 divide-y divide-white/10">
        {lectures.map((l) => (
          <li key={l.id ?? l.n}>
            <Link
              href={`/browse/watch/${courseId}?lecture=${l.n}`}
              className="group flex items-center gap-4 py-4"
            >
            <span className="w-5 shrink-0 text-center font-display text-[20px] font-extrabold tabnum text-white/50">
              {l.n}
            </span>
            <div className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-md bg-black ring-1 ring-white/10 sm:w-[150px]">
              <Image src={l.thumbnail} alt="" fill sizes="150px" className="object-cover" />
              <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="grid size-8 place-items-center rounded-full border border-white/80 bg-black/50 text-white">
                  <PlayIcon className="size-3.5 translate-x-px" />
                </span>
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[15px] font-bold">
                  {l.title}
                  {l.free && !owned ? (
                    <span className="ml-2 rounded bg-neon px-1.5 py-0.5 align-middle text-[9.5px] font-extrabold uppercase tracking-[0.12em] text-ink">
                      Free
                    </span>
                  ) : null}
                </p>
                <span className="shrink-0 text-[13px] font-semibold tabnum text-white/60" title={clockTime(l.seconds)}>
                  {minutes(l.seconds)}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-[13.5px] leading-relaxed text-white/65">{l.desc}</p>
            </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Course details dialog, opened from any card on the member pages. */
export function CourseModal({
  course,
  owned,
  lectures = [],
  onClose,
}: {
  course: Course | null;
  /** The member can watch every lesson of this course. */
  owned: boolean;
  /** The course's published lectures, listed as episodes. */
  lectures?: Lecture[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (course && !dialog.open) dialog.showModal();
    if (!course && dialog.open) dialog.close();
  }, [course]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(860px,calc(100vw-32px))] overflow-y-auto overscroll-contain rounded-2xl bg-[#141414] p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {course ? (
        <div>
          <div className="relative aspect-video max-h-[46vh] w-full">
            <Poster variant={course.poster} label="" />
            <div aria-hidden className="absolute inset-0 bg-linear-to-t from-[#141414] via-[#141414]/20 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
            >
              <svg viewBox="0 0 24 24" aria-hidden className="size-5">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
              <h2 className="max-w-lg text-[clamp(1.8rem,4vw,2.8rem)] font-extrabold leading-[1] text-white">
                {course.title}
              </h2>
              <Link
                href={`/browse/watch/${course.id}`}
                className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-[15px] font-bold text-ink transition-colors hover:bg-white/85"
              >
                <PlayIcon className="size-5" />
                {owned
                  ? "Play"
                  : lectures.some((l) => l.free)
                    ? "Watch free preview"
                    : `Unlock for ${course.price}`}
              </Link>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-[1.6fr_1fr] sm:p-10 sm:pt-4">
            <div>
              <p className="flex flex-wrap items-center gap-2 text-[14px] font-semibold">
                <span className="flex items-center gap-1 text-neon">
                  <Star className="size-3.5" />
                  {course.rating}
                </span>
                <span className="text-white/60">{course.hours}</span>
                <span className="rounded border border-white/40 px-1.5 text-[12px] text-white/80">{course.level}</span>
              </p>
              <p className="mt-4 text-[15.5px] leading-relaxed text-white/85">{course.blurb}</p>
            </div>
            <dl className="space-y-2 text-[14px]">
              <div>
                <dt className="inline text-white/50">Category: </dt>
                <dd className="inline">{course.category}</dd>
              </div>
              <div>
                <dt className="inline text-white/50">Length: </dt>
                <dd className="inline">{course.lessons}</dd>
              </div>
              <div>
                <dt className="inline text-white/50">Price: </dt>
                <dd className="inline font-bold">{owned ? "In your library" : course.price}</dd>
              </div>
            </dl>
          </div>

          {lectures.length ? <Episodes courseId={course.id} lectures={lectures} owned={owned} /> : null}
        </div>
      ) : null}
    </dialog>
  );
}
