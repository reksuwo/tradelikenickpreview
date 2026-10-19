"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ChartBackdrop } from "../chart-backdrop";
import { PlayIcon } from "../ui";
import type { Course } from "@/lib/courses";

const ART_MASK = "linear-gradient(to right, transparent, #000 32%)";

export function BrowseHero({
  course,
  art,
  preview,
  onInfo,
}: {
  course: Course;
  /** Key art behind the copy; the animated chart backdrop when there is none. */
  art?: string;
  /** A short silent clip that plays over the art while a mouse is on the hero, then stops. */
  preview?: string;
  onInfo: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hovering = useRef(false);
  const [previewing, setPreviewing] = useState(false);

  const stopPreview = () => {
    hovering.current = false;
    setPreviewing(false);
    videoRef.current?.pause();
  };

  const startPreview = (e: PointerEvent) => {
    const video = videoRef.current;
    // Mouse only: a tap on a phone should press the button under it, not start a clip.
    if (!video || e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    hovering.current = true;
    video.muted = true;
    video.currentTime = 0;
    video.play().then(
      // The pointer may have left while the clip was loading.
      () => (hovering.current ? setPreviewing(true) : video.pause()),
      () => setPreviewing(false),
    );
  };

  // Leaving the page mid-preview stops the clip.
  useEffect(() => {
    const video = videoRef.current;
    return () => video?.pause();
  }, []);

  return (
    <section className="px-4 sm:px-8 lg:px-[60px]">
      <div
        onPointerEnter={preview ? startPreview : undefined}
        onPointerLeave={preview ? stopPreview : undefined}
        className="relative isolate h-[min(78vh,820px)] min-h-[520px] overflow-hidden rounded-[22px] border border-white/10 bg-[#050807]"
      >
        {art ? (
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-full lg:w-[72%]"
            style={{ maskImage: ART_MASK, WebkitMaskImage: ART_MASK }}
          >
            <Image
              src={art}
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 1024px) 72vw, 100vw"
              className="object-cover"
            />
            {preview ? (
              <video
                ref={videoRef}
                src={preview}
                muted
                playsInline
                preload="metadata"
                onEnded={stopPreview}
                className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                  previewing ? "opacity-100" : "opacity-0"
                }`}
              />
            ) : null}
          </div>
        ) : (
          <ChartBackdrop className="opacity-90" />
        )}

        {/* Netflix-style shading so the copy always reads */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-black/85 via-black/35 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 to-transparent" />

        <span
          aria-hidden
          className={`absolute right-5 top-5 rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur transition-opacity duration-300 sm:right-8 sm:top-8 ${
            previewing ? "opacity-100" : "opacity-0"
          }`}
        >
          Preview
        </span>

        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-neon backdrop-blur">
            <span className="size-1.5 rounded-full bg-neon" />
            Featured course
          </p>

          <h1 className="mt-4 max-w-2xl text-[clamp(2.4rem,6vw,4.8rem)] font-extrabold leading-[0.95] text-white">
            {course.title}
          </h1>

          <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-semibold text-white">
            {[course.category, course.level, course.lessons, course.hours].map((item, i) => (
              <span key={item} className="flex items-center gap-2.5">
                {i > 0 ? <span className="size-1 rounded-full bg-white/50" /> : null}
                {item}
              </span>
            ))}
            <span className="ml-1 rounded border border-white/40 px-1.5 text-[12px] font-bold">
              ★ {course.rating}
            </span>
          </p>

          <p className="mt-4 hidden max-w-xl text-[16px] leading-relaxed text-white/80 sm:block">
            {course.blurb}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href={`/browse/watch/${course.id}`}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[16px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85"
              >
                <PlayIcon className="size-5" />
                Play
              </Link>
              <button
                type="button"
                onClick={onInfo}
                className="inline-flex items-center gap-2.5 rounded-full bg-white/20 px-7 py-3.5 text-[16px] font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/30"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-5">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 11v5.5M12 7.5v.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                More Info
              </button>
            </div>

            <p className="hidden items-center gap-2 text-[13.5px] font-bold text-white sm:flex">
              <span className="grid size-6 place-items-center rounded-md bg-neon text-[12px] text-ink">✓</span>
              Recommended for you
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
