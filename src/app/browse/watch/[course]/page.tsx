import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LecturePlayer } from "@/components/browse/lecture-player";
import { UnlockButton } from "@/components/browse/unlock-button";
import { Poster } from "@/components/poster";
import { PlayIcon } from "@/components/ui";
import { isAdmin } from "@/lib/admin";
import { getCourse } from "@/lib/course-store";
import { progressFor, publishedLectures } from "@/lib/lecture-store";
import { clockTime, minutes, type Lecture } from "@/lib/lectures";
import { getLibrary } from "@/lib/purchases";
import { objectExists, signedUrl } from "@/lib/r2";
import { getUser } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseId } = await params;
  const course = await getCourse(courseId);
  return { title: `${course?.title ?? "Watch"} — TradeLikeNick` };
}

function LockIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="currentColor" />
      <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** A signed link to the lecture's video, "missing" before it's uploaded, or "error" when R2 can't be reached. */
async function videoSource(lecture: Lecture) {
  if (!lecture.video) return "missing";
  try {
    if (!(await objectExists(lecture.video))) return "missing";
    return await signedUrl(lecture.video);
  } catch (error) {
    console.error("Loading lecture video failed", error);
    return "error";
  }
}

/**
 * The course player. Free lectures play for every member; the rest only for
 * members who own the course. Videos come from the private R2 bucket through
 * a link that expires after a few hours.
 */
export default async function WatchPage({ params, searchParams }: Props) {
  const { course: courseId } = await params;
  const course = await getCourse(courseId);
  if (!course) notFound();

  const { lecture: lectureParam } = await searchParams;
  const library = await getLibrary();
  const owned = library.courses.includes(course.id);
  const user = await getUser();
  // A hidden course is only there for people who own it, and admins checking it.
  if (!course.published && !owned && !isAdmin(user)) notFound();

  const lectures = (await publishedLectures())[course.id] ?? [];
  const current = lectures.find((l) => String(l.n) === lectureParam) ?? lectures[0];
  const unlocked = Boolean(current && (current.free || owned));
  const source = current && unlocked ? await videoSource(current) : null;
  const src = source === "missing" || source === "error" ? null : source;
  const nextLecture = current ? lectures[lectures.indexOf(current) + 1] : undefined;

  const progress = user
    ? await progressFor(user.id, lectures.flatMap((l) => (l.id ? [l.id] : [])))
    : {};

  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-6 sm:px-8 lg:pt-10">
      <Link href="/browse" className="text-[14px] font-semibold text-white/60 transition-colors hover:text-white">
        ← Back to browse
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-black ring-1 ring-white/10">
            {current && src ? (
              <LecturePlayer
                key={current.id ?? current.n}
                src={src}
                poster={current.thumbnail}
                title={`Lecture ${current.n}: ${current.title}`}
                lectureId={current.id}
                startAt={current.id ? progress[current.id]?.positionSeconds : 0}
              />
            ) : (
              <>
                {current ? (
                  <Image src={current.thumbnail} alt="" fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" />
                ) : (
                  <Poster variant={course.poster} label="" />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-6 text-center backdrop-blur-sm">
                  {source === "missing" ? (
                    <>
                      <p className="text-[18px] font-bold">This lecture is being uploaded</p>
                      <p className="mt-2 max-w-sm text-[14.5px] text-white/65">It&apos;ll play here as soon as it&apos;s ready. Check back soon.</p>
                    </>
                  ) : current && unlocked ? (
                    <>
                      <p className="text-[18px] font-bold">This video can&apos;t load right now</p>
                      <p className="mt-2 max-w-sm text-[14.5px] text-white/65">Refresh the page in a moment. If it keeps happening, contact support.</p>
                    </>
                  ) : owned ? (
                    <>
                      <p className="text-[18px] font-bold">You own this course</p>
                      <p className="mt-2 max-w-sm text-[14.5px] text-white/65">
                        Its lessons are being uploaded. They&apos;ll appear here as soon as they&apos;re ready.
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="grid size-12 place-items-center rounded-full bg-white/10 text-white">
                        <LockIcon className="size-5" />
                      </span>
                      <p className="mt-4 text-[18px] font-bold">
                        {current ? "Unlock the full course to watch this lecture" : "Unlock this course to start watching"}
                      </p>
                      <p className="mt-2 max-w-sm text-[14.5px] text-white/65">
                        One payment, lifetime access, 30-day refund guarantee.
                      </p>
                      <UnlockButton course={course} className="mt-5" />
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-neon">{course.title}</p>
            <h1 className="mt-1.5 text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold leading-tight">
              {current ? `${current.n}. ${current.title}` : course.title}
            </h1>
            <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-white/75">
              {current ? current.desc : course.blurb}
            </p>
            {nextLecture ? (
              <Link
                href={`?lecture=${nextLecture.n}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-bold text-ink transition-colors hover:bg-white/85"
              >
                Next: {nextLecture.title} →
              </Link>
            ) : null}
          </div>
        </div>

        <aside>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[17px] font-bold">Lectures</h2>
            {owned ? (
              <span className="text-[12.5px] font-semibold text-neon">In your library</span>
            ) : null}
          </div>

          {lectures.length ? (
            <ol className="mt-3 space-y-2">
              {lectures.map((l) => {
                const playing = l.n === current?.n;
                const locked = !l.free && !owned;
                const watched = l.id ? progress[l.id] : undefined;
                return (
                  <li key={l.id ?? l.n}>
                    <Link
                      href={`?lecture=${l.n}`}
                      aria-current={playing ? "true" : undefined}
                      className={`flex gap-3 rounded-xl p-2 transition-colors ${playing ? "bg-white/10 ring-1 ring-neon/60" : "hover:bg-white/5"}`}
                    >
                      <div className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-md bg-black">
                        <Image src={l.thumbnail} alt="" fill sizes="120px" className={`object-cover ${locked ? "opacity-50" : ""}`} />
                        <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1 text-[10.5px] font-bold tabnum">
                          {clockTime(l.seconds)}
                        </span>
                        {locked ? (
                          <span className="absolute left-1.5 top-1.5 grid size-5 place-items-center rounded-full bg-black/80">
                            <LockIcon className="size-3" />
                            <span className="sr-only">Locked</span>
                          </span>
                        ) : playing ? (
                          <span className="absolute inset-0 grid place-items-center bg-black/40">
                            <PlayIcon className="size-5 translate-x-0.5" />
                          </span>
                        ) : null}
                        {watched && !locked ? (
                          <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/25">
                            <span className="block h-full bg-neon" style={{ width: `${watched.percent}%` }} />
                          </span>
                        ) : null}
                      </div>
                      <div className="min-w-0 py-0.5">
                        <p className="line-clamp-2 text-[14px] font-bold leading-snug">
                          {l.n}. {l.title}
                        </p>
                        <p className="mt-1 text-[12.5px] text-white/50">
                          {minutes(l.seconds)}
                          {l.free && !owned ? <span className="ml-2 font-bold text-neon">Free</span> : null}
                          {watched?.completed ? <span className="ml-2 font-bold text-neon">✓ Watched</span> : null}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-3 rounded-xl border border-dashed border-white/15 p-5 text-[14px] leading-relaxed text-white/55">
              Lessons for this course are on their way. They&apos;ll be listed here as they&apos;re uploaded.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
