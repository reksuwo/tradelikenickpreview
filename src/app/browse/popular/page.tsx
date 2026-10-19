import type { Metadata } from "next";
import { BrowseHeading, CourseShelves } from "@/components/browse/course-shelves";
import { COURSES, POPULAR_IDS, byId } from "@/lib/courses";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "New & Popular — TradeLikeNick" };

export default async function PopularPage() {
  const library = await getLibrary();
  const topRated = [...COURSES].sort((a, b) => Number(b.rating) - Number(a.rating));
  // Placeholder order until courses carry release dates: last in the catalogue counts as newest.
  const recent = [...COURSES].reverse();

  return (
    <>
      <BrowseHeading title="New & Popular" intro="What members are watching this week, and what's just been added." />
      <CourseShelves
        owned={library.courses}
        rows={[
          { title: "Top Courses This Week", items: POPULAR_IDS.map((id) => ({ course: byId(id) })), ranked: true },
          { title: "Recently Added", items: recent.map((course) => ({ course })) },
          { title: "Highest Rated", items: topRated.map((course) => ({ course })) },
        ]}
      />
    </>
  );
}
