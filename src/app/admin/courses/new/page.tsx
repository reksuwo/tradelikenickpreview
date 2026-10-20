import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, Card } from "@/components/admin/admin-ui";
import { CourseForm } from "@/components/admin/course-form";
import { requireAdmin } from "@/lib/admin";
import { createCourse } from "@/lib/admin-actions";
import { getAllCourses } from "@/lib/course-store";
import { categoriesOf } from "@/lib/courses";

export const metadata: Metadata = { title: "New course" };

export default async function NewCourse() {
  await requireAdmin();
  const categories = categoriesOf(await getAllCourses()).filter((c) => c !== "All");

  return (
    <>
      <Link href="/admin/courses" className="text-[14px] font-semibold text-white/55 hover:text-white">
        ← Courses
      </Link>
      <div className="mt-3">
        <AdminHeading title="New course" intro="Fill in the details, then add its lectures on the next page." />
      </div>
      <div className="max-w-3xl">
        <Card>
          <CourseForm action={createCourse} categories={categories} />
        </Card>
      </div>
    </>
  );
}
