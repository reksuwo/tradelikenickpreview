/**
 * The recorded lectures of The Complete Trading System, in watch order, as the
 * marketing pages describe them.
 *
 * Member pages read lectures from the database instead (lib/lecture-store.ts),
 * where admins add, edit and upload them. These five were its starting rows.
 *
 * `thumbnail` is served from /public. `video` is the object key in the private
 * R2 bucket; members get a short-lived signed link to it, never the key itself.
 */
/** The course these lectures belong to (an id in COURSES). */
export const LECTURE_COURSE_ID = "complete-system";

/** Shown for a lecture that has no thumbnail yet. */
export const PLACEHOLDER_THUMBNAIL = "/thumbnails/placeholder.svg";

export type Lecture = {
  /** Database id; absent on the static list above. */
  id?: string;
  n: number;
  title: string;
  desc: string;
  /** Running time of the uploaded video, in seconds. */
  seconds: number;
  thumbnail: string;
  video: string;
  /** Watchable without buying the course. */
  free?: boolean;
  /** A short silent clip in /public, played when a member hovers the browse hero. */
  preview?: string;
};

export const LECTURES: Lecture[] = [
  {
    n: 1,
    title: "Finding the Trade",
    desc: "Patterns, support and resistance, and trend: how to spot an opportunity worth taking.",
    seconds: 353,
    thumbnail: "/thumbnails/lecture-01.webp",
    video: "Lectures/lecture-01.mp4",
    preview: "/previews/lecture-01.mp4",
    free: true,
  },
  {
    n: 2,
    title: "Building the Trade",
    desc: "Match the strategy to your outlook, then set risk and reward before anything is placed.",
    seconds: 627,
    thumbnail: "/thumbnails/lecture-02.webp",
    video: "Lectures/lecture-02.mp4",
    free: true,
  },
  {
    n: 3,
    title: "Executing the Trade",
    desc: "Entering cleanly, sizing the position, choosing order types and managing risk once you are in.",
    seconds: 649,
    thumbnail: "/thumbnails/lecture-03.webp",
    video: "Lectures/lecture-03.mp4",
  },
  {
    n: 4,
    title: "Tracking the Trade",
    desc: "Trading journal essentials: entry, exit, time in trade, profit or loss, and the notes that matter.",
    seconds: 226,
    thumbnail: "/thumbnails/lecture-04.webp",
    video: "Lectures/lecture-04.mp4",
  },
  {
    n: 5,
    title: "Review, Revise, Repeat",
    desc: "Find what worked, fix what did not, tighten your rules and run the process again.",
    seconds: 523,
    thumbnail: "/thumbnails/lecture-05.webp",
    video: "Lectures/lecture-05.mp4",
  },
];

/** "5:52" — for the badge on a thumbnail. */
export function clockTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** "6 min" — for running text. */
export function minutes(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}
