import type { Metadata } from "next";
import { CourseShelves } from "@/components/browse/course-shelves";
import { COURSES, ROWS, byId } from "@/lib/courses";

export const metadata: Metadata = { title: "Live — TradeLikeNick" };

export default function LivePage() {
  const advanced = ROWS[2];

  return (
    <CourseShelves
      featured={byId("live-archive")}
      rows={[
        { title: "Live sessions", items: COURSES.filter((c) => c.category === "Live").map((course) => ({ course })) },
        { title: advanced.title, items: advanced.ids.map((id) => ({ course: byId(id) })) },
      ]}
    />
  );
}
