import "server-only";
import { cache } from "react";
import { COURSES, formatPrice, type Course } from "./courses";
import { db } from "./db";

/** A course as admins edit it: the price in cents rather than as text. */
export type CourseRecord = Course & {
  priceCents: number | null;
  position: number;
  published: boolean;
  updatedAt: Date | null;
};

type Row = Omit<CourseRecord, "price" | "badge"> & { badge: string | null };

function toRecord(row: Row): CourseRecord {
  return { ...row, badge: row.badge ?? undefined, price: formatPrice(row.priceCents) };
}

/** The built-in list, shaped like database rows, for when the database can't be reached. */
function fallback(): CourseRecord[] {
  return COURSES.map((c, i) => ({
    ...c,
    priceCents: /^\$/.test(c.price) ? Math.round(Number(c.price.slice(1)) * 100) : null,
    position: i + 1,
    published: true,
    updatedAt: null,
  }));
}

/**
 * Every course, hidden ones included, in catalogue order. Cached per request.
 * Falls back to the built-in list if the database is down, so pages stay up.
 */
export const getAllCourses = cache(async (): Promise<CourseRecord[]> => {
  try {
    const rows = await db<Row[]>`
      select id, title, category, level, hours, lessons, price_cents as "priceCents", blurb, poster, badge,
             rating, position, published, updated_at as "updatedAt"
      from public.courses
      order by position, created_at
    `;
    return rows.map(toRecord);
  } catch (error) {
    console.error("getAllCourses failed", error);
    return fallback();
  }
});

/** The catalogue members and visitors see: published courses only. */
export const getCourses = cache(async (): Promise<Course[]> => (await getAllCourses()).filter((c) => c.published));

/**
 * "Top Courses This Week": course ids ranked by how many members watched any
 * of their lectures in the last `days` days, ties broken by time watched.
 * Courses nobody watched are left out. Cached per request.
 */
export const trendingCourseIds = cache(async (days = 7, limit = 10): Promise<string[]> => {
  try {
    const rows = await db<{ courseId: string }[]>`
      select l.course_id as "courseId"
      from public.watch_activity w
      join public.lectures l on l.id = w.lecture_id
      where w.day > current_date - ${days}::int
      group by l.course_id
      order by count(distinct w.user_id) desc, sum(w.seconds) desc
      limit ${limit}
    `;
    return rows.map((r) => r.courseId);
  } catch (error) {
    console.error("trendingCourseIds failed", error);
    return [];
  }
});

/** One course by id, hidden or not. Null when it doesn't exist. */
export async function getCourse(id: string): Promise<CourseRecord | null> {
  return (await getAllCourses()).find((c) => c.id === id) ?? null;
}
