import type { Metadata } from "next";
import { CourseShelves, type Shelf } from "@/components/browse/course-shelves";
import { CATEGORIES, COURSES, IN_PROGRESS, POPULAR_IDS, ROWS, byId } from "@/lib/courses";
import { LECTURE_COURSE_ID, LECTURES } from "@/lib/lectures";
import { requireMember } from "@/lib/member";

export const metadata: Metadata = {
  title: "Home — TradeLikeNick",
  description: "Your TradeLikeNick library: pick up where you left off or start something new.",
};

const toItems = (ids: string[]) => ids.map((id) => ({ course: byId(id) }));

export default async function BrowsePage() {
  const member = await requireMember("/browse");

  const categoryRows: Shelf[] = CATEGORIES.filter((c) => c !== "All")
    .map((c) => ({ title: c, items: COURSES.filter((k) => k.category === c).map((course) => ({ course })) }))
    .filter((r) => r.items.length > 1);

  const lectureCourse = byId(LECTURE_COURSE_ID);

  const rows: Shelf[] = [
    { title: `${lectureCourse.title}: Lectures`, lectures: LECTURES, course: lectureCourse },
    { id: "continue", title: `Continue Watching for ${member.firstName}`, items: IN_PROGRESS },
    { title: "Top Courses This Week", items: toItems(POPULAR_IDS), ranked: true },
    ...ROWS.map((row) => ({ title: row.title, items: toItems(row.ids) })),
    ...categoryRows,
    { title: "All Courses", items: COURSES.map((course) => ({ course })) },
  ];

  return (
    <CourseShelves featured={lectureCourse} featuredArt={LECTURES[0].thumbnail} rows={rows} />
  );
}
