import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getLibrary } from "@/lib/purchases";
import { getUser } from "@/lib/supabase/server";

/** The player reports about every 15 seconds; anything larger than this per report is ignored. */
const MAX_WATCHED_PER_REPORT = 120;

/** Watching this share of a lecture counts as finishing it. */
const COMPLETE_AT = 0.9;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The lecture player reports where a member is and how long they've been
 * playing. Sent with fetch while the page is open and with sendBeacon as it
 * closes, so the body is read as text.
 */
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return new NextResponse(null, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const lectureId = String(body.lectureId ?? "");
  const position = Math.max(0, Math.floor(Number(body.position) || 0));
  const watched = Math.min(MAX_WATCHED_PER_REPORT, Math.max(0, Math.round(Number(body.watched) || 0)));
  const ended = body.ended === true;
  if (!UUID.test(lectureId)) return new NextResponse(null, { status: 400 });

  const [lecture] = await db<{ courseId: string; seconds: number; free: boolean }[]>`
    select course_id as "courseId", seconds, free from public.lectures where id = ${lectureId} and published
  `;
  if (!lecture) return new NextResponse(null, { status: 404 });
  if (!lecture.free && !(await getLibrary()).courses.includes(lecture.courseId)) {
    return new NextResponse(null, { status: 403 });
  }

  const duration = lecture.seconds || Number(body.duration) || 0;
  const completed = ended || (duration > 0 && position >= duration * COMPLETE_AT);
  // A finished lecture starts from the top next time.
  const resumeAt = ended ? 0 : Math.min(position, duration || position);

  await db`
    insert into public.lecture_progress
      (user_id, lecture_id, position_seconds, furthest_seconds, watched_seconds, completed_at)
    values
      (${user.id}, ${lectureId}, ${resumeAt}, ${ended ? duration : position}, ${watched}, ${completed ? new Date() : null})
    on conflict (user_id, lecture_id) do update set
      position_seconds = excluded.position_seconds,
      furthest_seconds = greatest(lecture_progress.furthest_seconds, excluded.furthest_seconds),
      watched_seconds = lecture_progress.watched_seconds + excluded.watched_seconds,
      completed_at = coalesce(lecture_progress.completed_at, excluded.completed_at),
      updated_at = now()
  `;

  if (watched > 0) {
    await db`
      insert into public.watch_activity (user_id, lecture_id, day, seconds)
      values (${user.id}, ${lectureId}, current_date, ${watched})
      on conflict (user_id, lecture_id, day) do update set seconds = watch_activity.seconds + excluded.seconds
    `;
  }

  return new NextResponse(null, { status: 204 });
}
