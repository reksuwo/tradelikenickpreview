"use client";

import { useEffect, useRef } from "react";
import { Poster } from "../poster";
import { PlayIcon, Star } from "../ui";
import type { Course } from "@/lib/courses";

/** Course details dialog, opened from any card on the member pages. */
export function CourseModal({ course, onClose }: { course: Course | null; onClose: () => void }) {
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
      className="m-auto w-[min(860px,calc(100vw-32px))] overflow-hidden rounded-2xl bg-[#141414] p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
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
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3 text-[15px] font-bold text-ink transition-colors hover:bg-white/85"
              >
                <PlayIcon className="size-5" />
                {course.price === "Included" ? "Play" : "Watch free preview"}
              </button>
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
                <dd className="inline font-bold">{course.price}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
