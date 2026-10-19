import type { Metadata } from "next";
import { CourseShelves } from "@/components/browse/course-shelves";
import { getCourses } from "@/lib/course-store";
import { ROWS, pick } from "@/lib/courses";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "Live — TradeLikeNick" };

export default async function LivePage() {
  const advanced = ROWS[2];
  const [library, courses] = await Promise.all([getLibrary(), getCourses()]);
  const live = courses.filter((c) => c.category === "Live");

  return (
    <CourseShelves
      featured={live[0]}
      owned={library.courses}
      rows={[
        { title: "Live sessions", items: live.map((course) => ({ course })) },
        { title: advanced.title, items: pick(courses, advanced.ids).map((course) => ({ course })) },
      ]}
    />
  );
}
