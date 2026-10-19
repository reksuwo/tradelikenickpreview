import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/account/account-ui";
import { Poster } from "@/components/poster";
import { PlayIcon } from "@/components/ui";
import { getAllCourses } from "@/lib/course-store";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "My Courses — TradeLikeNick" };

export default async function MyCoursesPage() {
  const library = await getLibrary();
  // Hidden courses included: people who own one keep it.
  const courses = (await getAllCourses()).filter((c) => library.courses.includes(c.id));
  const boughtAny = courses.some((c) => c.price !== "Included");

  return (
    <>
      <PageHeading title="My Courses" intro="Every course you own, plus what's included with your membership." />

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <li key={course.id}>
            <Link
              href={`/browse/watch/${course.id}`}
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
                  {course.price === "Included" ? " · Included" : ""}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {boughtAny ? null : (
        <div className="mt-8 flex flex-col items-start gap-4 rounded-2xl border border-dashed border-white/15 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[14.5px] leading-relaxed text-white/60">
            Courses you buy appear here alongside the ones included with your membership.
          </p>
          <Link
            href="/browse/courses"
            className="shrink-0 rounded-full bg-white px-5 py-2.5 text-[14px] font-bold text-ink transition-colors hover:bg-white/85"
          >
            Browse courses
          </Link>
        </div>
      )}
    </>
  );
}
