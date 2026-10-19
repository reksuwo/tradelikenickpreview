"use client";

import { useEffect, useRef } from "react";

/** Tabs of the site tell each other when a lecture starts, so only one ever plays. */
const CHANNEL = "tln-lecture-player";

/** How often, while playing, the player tells the server where the member is. */
const REPORT_EVERY_MS = 15_000;

/** Sends progress to /api/progress. A beacon survives the page closing; fetch is used otherwise. */
function report(body: { lectureId: string; position: number; duration: number; watched: number; ended: boolean }, closing = false) {
  const json = JSON.stringify(body);
  if (closing && navigator.sendBeacon?.("/api/progress", json)) return;
  fetch("/api/progress", { method: "POST", body: json, keepalive: true }).catch(() => {});
}

/**
 * The lecture video. Only one of these plays at a time, across every tab of the site.
 *
 * The signed link is attached here, after React takes over the page, and never
 * appears in the server HTML. A <video autoplay src> in the HTML starts playing
 * before hydration, and if that element is ever replaced the original copy can
 * keep playing out of sight: two copies of the same lecture at once.
 */
export function LecturePlayer({
  src,
  poster,
  title,
  lectureId,
  startAt = 0,
}: {
  src: string;
  poster: string;
  title: string;
  /** Database id; when set, the player records the member's progress. */
  lectureId?: string;
  /** Second to resume from. */
  startAt?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  // Every server render signs a fresh link for the same file. Keep the first one,
  // so a page refresh doesn't restart the lecture. The parent remounts this
  // player (via `key`) when the member picks a different lecture.
  const source = useRef(src);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const channel = typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL);

    // Starting this player silences every other video or audio on the page and in other tabs.
    const onPlay = () => {
      document.querySelectorAll<HTMLMediaElement>("video, audio").forEach((el) => {
        if (el !== video && !el.paused) el.pause();
      });
      channel?.postMessage("play");
    };
    const onOtherTab = () => {
      if (!video.paused) video.pause();
    };

    video.addEventListener("play", onPlay);
    channel?.addEventListener("message", onOtherTab);

    // Resume where the member left off, unless that was the last few seconds.
    const onMetadata = () => {
      if (startAt > 5 && startAt < video.duration - 10) video.currentTime = startAt;
    };
    video.addEventListener("loadedmetadata", onMetadata, { once: true });

    // Count only time spent playing: small forward steps between timeupdates, never seeks.
    let last = 0;
    let unsent = 0;
    let lastSent = -1;
    const onTime = () => {
      const step = video.currentTime - last;
      if (!video.paused && step > 0 && step < 2 * video.playbackRate + 1) unsent += step / video.playbackRate;
      last = video.currentTime;
    };
    const onSeek = () => (last = video.currentTime);
    const flush = (ended = false, closing = false) => {
      if (!lectureId) return;
      const position = Math.floor(video.currentTime);
      const watched = Math.floor(unsent);
      if (!ended && watched === 0 && position === lastSent) return;
      unsent -= watched;
      lastSent = position;
      report({ lectureId, position, duration: Math.round(video.duration || 0), watched, ended }, closing);
    };
    const onPause = () => flush(false);
    const onEnded = () => flush(true);
    const onHide = () => document.visibilityState === "hidden" && flush(false, true);
    const timer = window.setInterval(() => !video.paused && flush(), REPORT_EVERY_MS);

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("seeking", onSeek);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    document.addEventListener("visibilitychange", onHide);

    video.src = source.current;
    // Start straight away when the browser allows it; otherwise the member presses play.
    video.play().catch(() => {});

    return () => {
      flush(false, true);
      window.clearInterval(timer);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeking", onSeek);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("loadedmetadata", onMetadata);
      document.removeEventListener("visibilitychange", onHide);
      video.removeEventListener("play", onPlay);
      channel?.removeEventListener("message", onOtherTab);
      channel?.close();
      // Stop and release the stream, so nothing keeps playing after the page changes.
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
    // Props are read once: the parent remounts the player for another lecture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <video
      ref={ref}
      poster={poster}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      aria-label={title}
      className="size-full"
    />
  );
}
