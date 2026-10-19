import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { LoadError } from "@/components/admin/admin-parts";
import {
  AdminHeading,
  BUTTON,
  BUTTON_DANGER,
  BUTTON_QUIET,
  Badge,
  Card,
  Empty,
  INPUT,
  Meter,
  SearchBox,
  StatTile,
  TD,
  TH,
  ago,
  money,
  watchTime,
} from "@/components/admin/admin-ui";
import { PagedList, PagedTable } from "@/components/admin/paged";
import { requireAdmin } from "@/lib/admin";
import { CourseForm } from "@/components/admin/course-form";
import { createLecture, deleteCourse, moveLecture, updateCourse } from "@/lib/admin-actions";
import { courseLearners, courseStats, lectureFunnel } from "@/lib/admin-data";
import { getAllCourses, getCourse } from "@/lib/course-store";
import { categoriesOf } from "@/lib/courses";
import { listLectureRecords, thumbnailUrl } from "@/lib/lecture-store";
import { clockTime } from "@/lib/lectures";

type Props = {
  params: Promise<{ course: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  return { title: (await getCourse(course))?.title ?? "Course" };
}

const ARROW = "grid size-8 place-items-center rounded-full text-white/60 ring-1 ring-white/10 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30";

export default async function AdminCourse({ params, searchParams }: Props) {
  await requireAdmin();
  const { course: courseId } = await params;
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const course = await getCourse(courseId);
  if (!course) notFound();
  const categories = categoriesOf(await getAllCourses()).filter((c) => c !== "All");

  let data;
  try {
    const [lectures, funnel, learners, stats] = await Promise.all([
      listLectureRecords(course.id),
      lectureFunnel(course.id),
      courseLearners(course.id, { q }),
      courseStats(),
    ]);
    data = { lectures, funnel, learners, stats: stats[course.id] };
  } catch (error) {
    return <LoadError error={error} />;
  }
  const { lectures, funnel, learners, stats } = data;
  const byLecture = Object.fromEntries(funnel.map((f) => [f.id, f]));
  const totalSeconds = lectures.filter((l) => l.published).reduce((t, l) => t + l.seconds, 0);
  const publishedCount = lectures.filter((l) => l.published).length;

  return (
    <>
      <Link href="/admin/courses" className="text-[14px] font-semibold text-white/55 hover:text-white">
        ← Courses
      </Link>
      <div className="mt-3">
        <AdminHeading
          title={course.title}
          intro={`${course.category} · ${course.level} · ${course.price}${course.published ? "" : " · Hidden from the catalogue"}`}
          actions={
            <Link href={`/browse/watch/${course.id}`} className={BUTTON_QUIET}>
              View as member
            </Link>
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="Owners"
          value={course.price === "Included" ? "Everyone" : String(stats.owners)}
          hint={course.price === "Included" ? "Included with membership" : `${money(stats.revenue)} revenue`}
        />
        <StatTile label="Learners" value={String(stats.learners)} hint="Started at least one lecture" />
        <StatTile label="Finished" value={String(stats.finishers)} hint="Completed every published lecture" />
        <StatTile label="Watch time" value={watchTime(stats.watchSeconds)} hint={`${lectures.length} lectures · ${clockTime(totalSeconds)} published`} />
      </div>

      <div className="mt-6">
        <Card
          title="Lectures"
          description="Members see published lectures in this order. New lectures start as drafts."
          flush
        >
          <PagedList
            ordered
            empty={<Empty>No lectures yet. Add the first one below, then upload its video.</Empty>}
            items={lectures.map((l, i) => {
              const f = byLecture[l.id];
              return (
                <li key={l.id} className="flex items-center gap-4 border-b border-white/[0.06] px-5 py-3 sm:px-6">
                  <div className="flex shrink-0 flex-col gap-1">
                    <ActionForm action={moveLecture}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button type="submit" disabled={i === 0} aria-label={`Move ${l.title} up`} className={ARROW}>
                        ↑
                      </button>
                    </ActionForm>
                    <ActionForm action={moveLecture}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button type="submit" disabled={i === lectures.length - 1} aria-label={`Move ${l.title} down`} className={ARROW}>
                        ↓
                      </button>
                    </ActionForm>
                  </div>

                  <Link href={`/admin/courses/${course.id}/lectures/${l.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                    <span className="relative aspect-video w-[112px] shrink-0 overflow-hidden rounded-md bg-black ring-1 ring-white/10">
                      <Image src={thumbnailUrl(l.thumbnail)} alt="" fill sizes="112px" className="object-cover" />
                      {l.seconds ? (
                        <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1 text-[10.5px] font-bold tabnum">{clockTime(l.seconds)}</span>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-[15px] font-semibold text-white group-hover:underline">
                          {l.position}. {l.title}
                        </span>
                        {l.published ? <Badge tone="good">Published</Badge> : <Badge tone="warn">Draft</Badge>}
                        {l.free ? <Badge>Free</Badge> : null}
                        {l.videoKey ? null : <Badge tone="bad">No video</Badge>}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-white/45">{l.description || "No description"}</span>
                    </span>
                  </Link>

                  <span className="hidden w-[160px] shrink-0 text-[12.5px] text-white/50 md:block">
                    {f?.started ? (
                      <>
                        <span className="tabnum">
                          {f.started} started · {f.completed} done
                        </span>
                        <Meter value={f.avgPercent} />
                      </>
                    ) : (
                      "No views yet"
                    )}
                  </span>
                </li>
              );
            })}
          />

          <ActionForm action={createLecture} className="flex flex-wrap items-start gap-3 px-5 py-5 sm:px-6" noticeClassName="basis-full">
            <input type="hidden" name="courseId" value={course.id} />
            <input name="title" required minLength={2} placeholder="New lecture title" aria-label="New lecture title" className={`${INPUT} max-w-md flex-1`} />
            <Submit className={BUTTON} pending="Adding…">
              Add lecture
            </Submit>
          </ActionForm>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card title="Course details" description="What members and visitors see on course cards, and what checkout charges.">
          <CourseForm action={updateCourse} course={course} categories={categories} />
        </Card>
        <div className="space-y-6">
          <Card title="Hide or delete">
            <p className="text-[13.5px] leading-relaxed text-white/55">
              To take a course off the site, untick <strong className="text-white/80">Show in the catalogue</strong> and save. Owners keep access.
              Deleting is only possible for a course nobody has bought and that has no lectures.
            </p>
            <ActionForm action={deleteCourse} confirm={`Delete "${course.title}"? This can't be undone.`} className="mt-4 space-y-2">
              <input type="hidden" name="id" value={course.id} />
              <Submit className={BUTTON_DANGER} pending="Deleting…">
                Delete course
              </Submit>
            </ActionForm>
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <Card title="Learners" description="Members who have started this course, most recent first." flush>
          <div className="px-5 sm:px-6">
            <SearchBox base={`/admin/courses/${course.id}`} params={{ q: q || undefined }} placeholder="Search learners by name or email" />
          </div>
          <div className="mt-3">
            <PagedTable
              key={q}
              head={
                <tr>
                  <th className={TH}>Member</th>
                  <th className={`${TH} w-[200px]`}>Progress</th>
                  <th className={`${TH} text-right`}>Watch time</th>
                  <th className={`${TH} text-right`}>Last watched</th>
                </tr>
              }
              rows={learners.map((m) => (
                <tr key={m.userId}>
                  <td className={TD}>
                    <Link href={`/admin/members/${m.userId}`} className="font-semibold text-white hover:underline">
                      {m.name}
                    </Link>
                    <span className="block text-[12.5px] text-white/45">{m.email}</span>
                  </td>
                  <td className={TD}>
                    <Meter value={publishedCount ? (m.completed / publishedCount) * 100 : 0} label={`${m.completed}/${publishedCount}`} />
                  </td>
                  <td className={`${TD} text-right`}>{watchTime(m.watchedSeconds)}</td>
                  <td className={`${TD} text-right text-white/55`}>{ago(m.lastWatchedAt)}</td>
                </tr>
              ))}
              empty={<Empty>{q ? `No learners match “${q}”.` : "Nobody has started this course yet."}</Empty>}
            />
          </div>
        </Card>
      </div>
    </>
  );
}
