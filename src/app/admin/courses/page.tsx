import type { Metadata } from "next";
import Link from "next/link";
import { LoadError } from "@/components/admin/admin-parts";
import { AdminHeading, Badge, Card, Empty, Meter, SearchBox, TD, TH, money, watchTime } from "@/components/admin/admin-ui";
import { PagedTable } from "@/components/admin/paged";
import { requireAdmin } from "@/lib/admin";
import { courseStats, searchLectures } from "@/lib/admin-data";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = { title: "Courses" };

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function AdminCourses({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  let stats, lectureHits;
  try {
    [stats, lectureHits] = await Promise.all([courseStats(), q ? searchLectures(q) : []]);
  } catch (error) {
    return <LoadError error={error} />;
  }

  // A course matches on its own title or category, or on one of its lectures.
  const needle = q.toLowerCase();
  const hitsByCourse = Object.groupBy(lectureHits, (l) => l.courseId);
  const courses = COURSES.filter(
    (c) => !needle || [c.title, c.category, c.id].some((f) => f.toLowerCase().includes(needle)) || hitsByCourse[c.id],
  );

  return (
    <>
      <AdminHeading
        title="Courses"
        intro="Upload and arrange each course's lectures, and see who's watching. Titles, prices and descriptions are set in src/lib/courses.ts."
      />

      <div className="mb-4">
        <SearchBox base="/admin/courses" params={{ q: q || undefined }} placeholder="Search courses or lecture titles" />
      </div>

      <Card flush>
        <PagedTable
          key={q}
          head={
            <tr>
              <th className={TH}>Course</th>
              <th className={TH}>Lectures</th>
              <th className={`${TH} text-right`}>Owners</th>
              <th className={`${TH} text-right`}>Revenue</th>
              <th className={`${TH} text-right`}>Learners</th>
              <th className={`${TH} w-[160px]`}>Finished</th>
              <th className={`${TH} text-right`}>Watch time</th>
            </tr>
          }
          rows={courses.map((c) => {
            const s = stats[c.id];
            const hits = hitsByCourse[c.id] ?? [];
            return (
              <tr key={c.id} className="transition-colors hover:bg-white/[0.02]">
                <td className={TD}>
                  <Link href={`/admin/courses/${c.id}`} className="font-semibold text-white hover:underline">
                    {c.title}
                  </Link>
                  <span className="block text-[12.5px] text-white/45">
                    {c.category} · {c.price}
                  </span>
                  {hits.map((l) => (
                    <Link
                      key={l.id}
                      href={`/admin/courses/${c.id}/lectures/${l.id}`}
                      className="mt-1 block text-[12.5px] text-neon hover:underline"
                    >
                      Lecture {l.position}: {l.title}
                    </Link>
                  ))}
                </td>
                <td className={TD}>
                  {s.lectures ? (
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span>{s.published} live</span>
                      {s.lectures > s.published ? <Badge tone="warn">{s.lectures - s.published} draft</Badge> : null}
                    </span>
                  ) : (
                    <Link href={`/admin/courses/${c.id}`} className="font-semibold text-neon hover:underline">
                      Add lectures
                    </Link>
                  )}
                </td>
                <td className={`${TD} text-right`}>{c.price === "Included" ? <Badge>Everyone</Badge> : s.owners}</td>
                <td className={`${TD} text-right`}>{money(s.revenue)}</td>
                <td className={`${TD} text-right`}>{s.learners}</td>
                <td className={TD}>
                  {s.learners ? <Meter value={(s.finishers / s.learners) * 100} label={`${s.finishers}`} /> : <span className="text-white/35">—</span>}
                </td>
                <td className={`${TD} text-right`}>{s.watchSeconds ? watchTime(s.watchSeconds) : "—"}</td>
              </tr>
            );
          })}
          empty={<Empty>No courses or lectures match “{q}”.</Empty>}
        />
      </Card>
    </>
  );
}
