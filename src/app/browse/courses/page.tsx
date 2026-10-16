import type { Metadata } from "next";
import { CourseCatalog } from "@/components/course-catalog";

export const metadata: Metadata = { title: "All Courses — TradeLikeNick" };

export default function AllCoursesPage() {
  return <CourseCatalog tone="dark" watchHref="/browse" />;
}
