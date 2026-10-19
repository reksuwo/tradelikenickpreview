import "server-only";
import { cache } from "react";
import { db } from "./db";
import { LECTURE_COURSE_ID, LECTURES, PLACEHOLDER_THUMBNAIL, type Lecture } from "./lectures";

/** A lecture as admins see it: every column, drafts included. */
export type LectureRecord = {
  id: string;
  courseId: string;
  position: number;
  title: string;
  description: string;
  seconds: number;
  videoKey: string | null;
  thumbnail: string | null;
  preview: string | null;
  free: boolean;
  published: boolean;
  updatedAt: Date;
};

const columns = () => db`
  id, course_id as "courseId", position, title, description, seconds, video_key as "videoKey",
  thumbnail, preview, free, published, updated_at as "updatedAt"
`;

/**
 * Where the browser loads a thumbnail from. Uploaded ones live in the private
 * bucket under Thumbnails/ and are served through /api/thumbnails; the
 * original five are files in /public.
 */
export function thumbnailUrl(thumbnail: string | null) {
  if (!thumbnail) return PLACEHOLDER_THUMBNAIL;
  return thumbnail.startsWith("/") ? thumbnail : `/api/thumbnails/${thumbnail.replace(/^Thumbnails\//, "")}`;
}

/** The shape member pages and the browse components already use. */
export function toLecture(record: LectureRecord): Lecture {
  return {
    id: record.id,
    n: record.position,
    title: record.title,
    desc: record.description,
    seconds: record.seconds,
    thumbnail: thumbnailUrl(record.thumbnail),
    video: record.videoKey ?? "",
    free: record.free,
    preview: record.preview ?? undefined,
  };
}

/** Every lecture of a course, drafts included, in watch order. */
export async function listLectureRecords(courseId: string): Promise<LectureRecord[]> {
  return db<LectureRecord[]>`
    select ${columns()} from public.lectures where course_id = ${courseId} order by position, created_at
  `;
}

export async function getLectureRecord(id: string): Promise<LectureRecord | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db<LectureRecord[]>`select ${columns()} from public.lectures where id = ${id}`;
  return row ?? null;
}

/**
 * The published lectures members can see, grouped by course. Falls back to the
 * built-in list if the database can't be reached, so the browse pages stay up.
 * Cached per request.
 */
export const publishedLectures = cache(async (): Promise<Record<string, Lecture[]>> => {
  try {
    const rows = await db<LectureRecord[]>`
      select ${columns()} from public.lectures where published order by course_id, position, created_at
    `;
    const byCourse: Record<string, Lecture[]> = {};
    for (const row of rows) (byCourse[row.courseId] ??= []).push(toLecture(row));
    return byCourse;
  } catch (error) {
    console.error("publishedLectures failed", error);
    return { [LECTURE_COURSE_ID]: LECTURES };
  }
});

/** One member's place in each lecture they've started. */
export type LectureProgress = { positionSeconds: number; completed: boolean; percent: number };

export async function progressFor(userId: string, lectureIds: string[]): Promise<Record<string, LectureProgress>> {
  if (!lectureIds.length) return {};
  try {
    const rows = await db<{ lectureId: string; positionSeconds: number; furthestSeconds: number; seconds: number; completed: boolean }[]>`
      select p.lecture_id as "lectureId", p.position_seconds as "positionSeconds",
             p.furthest_seconds as "furthestSeconds", l.seconds, p.completed_at is not null as completed
      from public.lecture_progress p
      join public.lectures l on l.id = p.lecture_id
      where p.user_id = ${userId} and p.lecture_id in ${db(lectureIds)}
    `;
    return Object.fromEntries(
      rows.map((r) => [
        r.lectureId,
        {
          positionSeconds: r.positionSeconds,
          completed: r.completed,
          percent: r.completed ? 100 : r.seconds ? Math.min(99, Math.round((r.furthestSeconds / r.seconds) * 100)) : 0,
        },
      ]),
    );
  } catch (error) {
    console.error("progressFor failed", error);
    return {};
  }
}
