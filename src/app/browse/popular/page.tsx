import type { Metadata } from "next";
import { BrowseHeading, CourseShelves } from "@/components/browse/course-shelves";
import { getCourses } from "@/lib/course-store";
import { POPULAR_IDS, pick } from "@/lib/courses";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "New & Popular — TradeLikeNick" };

export default async function PopularPage() {
  const [library, courses] = await Promise.all([getLibrary(), getCourses()]);
  const topRated = [...courses].sort((a, b) => Number(b.rating) - Number(a.rating));
  // Placeholder order until courses carry release dates: last in the catalogue counts as newest.
  const recent = [...courses].reverse();

  return (
    <>
      <BrowseHeading title="New & Popular" intro="What members are watching this week, and what's just been added." />
      <CourseShelves
        owned={library.courses}
        rows={[
          { title: "Top Courses This Week", items: pick(courses, POPULAR_IDS).map((course) => ({ course })), ranked: true },
          { title: "Recently Added", items: recent.map((course) => ({ course })) },
          { title: "Highest Rated", items: topRated.map((course) => ({ course })) },
        ]}
      />
    </>
  );
}
