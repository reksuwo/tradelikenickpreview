import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "All Courses — TradeLikeNick" };

export default async function AllCoursesPage() {
  const library = await getLibrary();
  return <CourseCatalog tone="dark" owned={library.courses} />;
}
