import type { Metadata } from "next";
import { CourseShelves, type Shelf } from "@/components/browse/course-shelves";
import { getCourses } from "@/lib/course-store";
import { POPULAR_IDS, ROWS, categoriesOf, pick } from "@/lib/courses";
import { publishedLectures } from "@/lib/lecture-store";
import { LECTURE_COURSE_ID } from "@/lib/lectures";
import { requireMember } from "@/lib/member";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = {
  title: "Home — TradeLikeNick",
  description: "Your TradeLikeNick library: pick up where you left off or start something new.",
};

export default async function BrowsePage() {
  const member = await requireMember("/browse");
  const [library, courses, lectures] = await Promise.all([getLibrary(), getCourses(), publishedLectures()]);
  const toItems = (ids: string[]) => pick(courses, ids).map((course) => ({ course }));
  const mine = courses.filter((c) => library.courses.includes(c.id)).map((course) => ({ course }));

  const categoryRows: Shelf[] = categoriesOf(courses)
    .filter((c) => c !== "All")
    .map((c) => ({ title: c, items: courses.filter((k) => k.category === c).map((course) => ({ course })) }))
    .filter((r) => r.items.length > 1);

  // The hero features the flagship course, or the first course with lectures if it's gone.
  const lectureCourse =
    courses.find((c) => c.id === LECTURE_COURSE_ID) ?? courses.find((c) => lectures[c.id]?.length) ?? courses[0];
  const featuredLecture = lectureCourse ? lectures[lectureCourse.id]?.[0] : undefined;
  // One row per course with published lectures, the featured course first.
  const lectureRows: Shelf[] = courses
    .filter((c) => lectures[c.id]?.length)
    .sort((a, b) => Number(b.id === lectureCourse?.id) - Number(a.id === lectureCourse?.id))
    .map((course) => ({ title: `${course.title}: Lectures`, lectures: lectures[course.id], course }));

  const rows: Shelf[] = [
    ...lectureRows,
    { id: "my-courses", title: `My Courses, ${member.firstName}`, items: mine },
    { title: "Top Courses This Week", items: toItems(POPULAR_IDS), ranked: true },
    ...ROWS.map((row) => ({ title: row.title, items: toItems(row.ids) })),
    ...categoryRows,
    { title: "All Courses", items: courses.map((course) => ({ course })) },
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
