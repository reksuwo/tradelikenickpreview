import type { Metadata } from "next";
import { BrowseHeading, CourseShelves } from "@/components/browse/course-shelves";
import { getCourses, trendingCourseIds } from "@/lib/course-store";
import { pick } from "@/lib/courses";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "New & Popular — TradeLikeNick" };

export default async function PopularPage() {
  const [library, courses, trending] = await Promise.all([getLibrary(), getCourses(), trendingCourseIds()]);
  const top = pick(courses, trending).map((course) => ({ course }));
  const topRated = [...courses].sort((a, b) => Number(b.rating) - Number(a.rating));
  // Placeholder order until courses carry release dates: last in the catalogue counts as newest.
  const recent = [...courses].reverse();

  return (
    <>
      <BrowseHeading title="New & Popular" intro="What members are watching this week, and what's just been added." />
      <CourseShelves
        owned={library.courses}
        rows={[
          ...(top.length ? [{ title: "Top Courses This Week", items: top, ranked: true }] : []),
          { title: "Recently Added", items: recent.map((course) => ({ course })) },
          { title: "Highest Rated", items: topRated.map((course) => ({ course })) },
        ]}
      />
    </>
  );
}
