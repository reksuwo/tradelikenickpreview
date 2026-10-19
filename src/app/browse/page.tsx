import type { Metadata } from "next";
import { CourseShelves, type Shelf } from "@/components/browse/course-shelves";
import { CATEGORIES, COURSES, POPULAR_IDS, ROWS, byId } from "@/lib/courses";
import { publishedLectures } from "@/lib/lecture-store";
import { LECTURE_COURSE_ID } from "@/lib/lectures";
import { requireMember } from "@/lib/member";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = {
  title: "Home — TradeLikeNick",
  description: "Your TradeLikeNick library: pick up where you left off or start something new.",
};

const toItems = (ids: string[]) => ids.map((id) => ({ course: byId(id) }));

export default async function BrowsePage() {
  const member = await requireMember("/browse");
  const library = await getLibrary();
  const mine = COURSES.filter((c) => library.courses.includes(c.id)).map((course) => ({ course }));

  const categoryRows: Shelf[] = CATEGORIES.filter((c) => c !== "All")
    .map((c) => ({ title: c, items: COURSES.filter((k) => k.category === c).map((course) => ({ course })) }))
    .filter((r) => r.items.length > 1);

  const lectures = await publishedLectures();
  const lectureCourse = byId(LECTURE_COURSE_ID);
  const featuredLecture = lectures[LECTURE_COURSE_ID]?.[0];
  // One row per course with published lectures, the featured course first.
  const lectureRows: Shelf[] = COURSES.filter((c) => lectures[c.id]?.length)
    .sort((a, b) => Number(b.id === LECTURE_COURSE_ID) - Number(a.id === LECTURE_COURSE_ID))
    .map((course) => ({ title: `${course.title}: Lectures`, lectures: lectures[course.id], course }));

  const rows: Shelf[] = [
    ...lectureRows,
    { id: "my-courses", title: `My Courses, ${member.firstName}`, items: mine },
    { title: "Top Courses This Week", items: toItems(POPULAR_IDS), ranked: true },
    ...ROWS.map((row) => ({ title: row.title, items: toItems(row.ids) })),
    ...categoryRows,
    { title: "All Courses", items: COURSES.map((course) => ({ course })) },
  ];

  return (
    <CourseShelves
      featured={lectureCourse}
      featuredArt={featuredLecture?.thumbnail}
      featuredPreview={featuredLecture?.preview}
      rows={rows}
      owned={library.courses}
      lectures={lectures}
    />
  );
}
