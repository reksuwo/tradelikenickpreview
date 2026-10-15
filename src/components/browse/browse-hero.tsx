"use client";

import { useRef, useState } from "react";
import { ChartBackdrop } from "../chart-backdrop";
import { PlayIcon } from "../ui";
import type { Course } from "@/lib/courses";

/**
 * Drop a trailer at public/hero.mp4 and it autoplays (muted) here. Until that
 * file exists, the animated chart backdrop stands in for the video.
 */
const HERO_VIDEO = "/hero.mp4";

export function BrowseHero({ course, onInfo }: { course: Course; onInfo: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "failed">("loading");
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <section className="px-4 sm:px-8 lg:px-[60px]">
      <div className="relative isolate h-[min(78vh,820px)] min-h-[520px] overflow-hidden rounded-[22px] border border-white/10 bg-[#050807]">
        {/* Video, or the animated chart while there is none */}
        {status !== "playing" ? <ChartBackdrop className="opacity-90" /> : null}
        {status !== "failed" ? (
          <video
            ref={videoRef}
            src={HERO_VIDEO}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setStatus("playing")}
            onError={() => setStatus("failed")}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ${
              status === "playing" ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {/* Netflix-style shading so the copy always reads */}
        <div aria-hidden className="absolute inset-0 bg-linear-to-r from-black/85 via-black/35 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 to-transparent" />

        {status === "playing" ? (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute trailer" : "Mute trailer"}
            className="absolute right-5 top-5 grid size-10 place-items-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur transition-colors hover:bg-white/15 sm:right-8 sm:top-8"
          >
            <svg viewBox="0 0 24 24" aria-hidden className="size-5">
              <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
              {muted ? (
                <path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path
                  d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        ) : null}

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
              <button
                type="button"
                onClick={onInfo}
                className="inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-[16px] font-bold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/85"
              >
                <PlayIcon className="size-5" />
                Play
              </button>
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
