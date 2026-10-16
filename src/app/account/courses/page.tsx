import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/account/account-ui";
import { Poster } from "@/components/poster";
import { PlayIcon } from "@/components/ui";
import { IN_PROGRESS } from "@/lib/courses";

export const metadata: Metadata = { title: "My Courses — TradeLikeNick" };

export default function MyCoursesPage() {
  return (
    <>
      <PageHeading title="My Courses" intro="Everything you're enrolled in, with where you left off." />

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {IN_PROGRESS.map(({ course, progress, note }) => (
          <li key={course.id}>
            <Link
              href="/browse"
              className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-colors hover:border-white/25"
            >
              <div className="relative aspect-video">
                <Poster variant={course.poster} label="" />
                <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid size-12 place-items-center rounded-full bg-white text-ink">
                    <PlayIcon className="size-5 translate-x-0.5" />
                  </span>
                </span>
              </div>
              <div className="p-4">
                <p className="font-display text-[16px] font-extrabold leading-snug text-white">{course.title}</p>
                <p className="mt-1 text-[13px] text-white/50">
                  {course.category} · {course.lessons}
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                    <div className="h-full rounded-full bg-neon" style={{ width: `${Math.round(progress * 100)}%` }} />
                  </div>
                  <span className="text-[12.5px] font-semibold text-white/70">{Math.round(progress * 100)}%</span>
                </div>
                <p className="mt-2 text-[12.5px] text-white/45">{note}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
