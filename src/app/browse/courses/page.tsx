import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";
import { getCourses } from "@/lib/course-store";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "All Courses — TradeLikeNick" };

export default async function AllCoursesPage() {
  const [library, courses] = await Promise.all([getLibrary(), getCourses()]);
  return <CourseCatalog tone="dark" courses={courses} owned={library.courses} />;
}
