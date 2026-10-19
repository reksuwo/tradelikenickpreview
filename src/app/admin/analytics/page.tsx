import type { Metadata } from "next";
import Link from "next/link";
import { LoadError } from "@/components/admin/admin-parts";
import {
  AdminHeading,
  BUTTON_QUIET,
  Badge,
  Card,
  Empty,
  INPUT,
  Meter,
  SearchBox,
  Segmented,
  StatTile,
  TD,
  TH,
  compact,
  money,
  percent,
  watchTime,
} from "@/components/admin/admin-ui";
import { ColumnChart } from "@/components/admin/column-chart";
import { PagedTable } from "@/components/admin/paged";
import { requireAdmin } from "@/lib/admin";
import {
  activeLearners,
  addDays,
  bookStats,
  bucketFor,
  courseStats,
  daily,
  lastDays,
  lectureFunnel,
  spanDays,
  today,
  type DateRange,
} from "@/lib/admin-data";
import { BOOKS } from "@/lib/books";
import { getAllCourses } from "@/lib/course-store";
import { LECTURE_COURSE_ID } from "@/lib/lectures";

export const metadata: Metadata = { title: "Analytics" };

const PRESETS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "12 months" },
];

/** Longest custom range, so a typo can't ask for a century of rows. */
const MAX_DAYS = 3 * 366;

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

function isDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

/** A preset (?range=30) or a custom range (?from=2026-09-01&to=2026-09-30). Defaults to the last 30 days. */
function readRange(sp: Record<string, string | string[] | undefined>): { range: DateRange; preset: string } {
  if (isDay(sp.from) && isDay(sp.to)) {
    const now = today();
    let [from, to] = sp.from <= sp.to ? [sp.from, sp.to] : [sp.to, sp.from];
    if (to > now) to = now;
    if (from > to) from = to;
    if (spanDays({ from, to }) > MAX_DAYS) from = addDays(to, -(MAX_DAYS - 1));
    return { range: { from, to }, preset: "" };
  }
  const preset = PRESETS.some((p) => p.value === sp.range) ? String(sp.range) : "30";
  return { range: lastDays(Number(preset)), preset };
}

function rangeLabel({ from, to }: DateRange) {
  const fmt = (d: string, year: boolean) =>
    new Date(`${d}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: year ? "numeric" : undefined, timeZone: "UTC" });
  return from === to ? fmt(from, true) : `${fmt(from, from.slice(0, 4) !== to.slice(0, 4))} – ${fmt(to, true)}`;
}

const BUCKET_WORD = { day: "day", week: "week", month: "month" } as const;

export default async function AnalyticsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const { range, preset } = readRange(sp);
  const bucket = bucketFor(range);
  const days = spanDays(range);
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const courseParam = typeof sp.course === "string" ? sp.course : "";

  let data;
  try {
    const [series, learners, courses, books, catalogue] = await Promise.all([
      daily(range, bucket),
      activeLearners(range),
      courseStats(),
      bookStats(),
      getAllCourses(),
    ]);
    const withLectures = catalogue.filter((c) => courses[c.id].lectures > 0);
    const funnelCourse =
      withLectures.find((c) => c.id === courseParam) ?? withLectures.find((c) => c.id === LECTURE_COURSE_ID) ?? withLectures[0];
    const funnel = funnelCourse ? await lectureFunnel(funnelCourse.id) : [];
    data = { series, learners, courses, books, catalogue, withLectures, funnelCourse, funnel };
  } catch (error) {
    return <LoadError error={error} />;
  }
  const { series, learners, courses, books, catalogue, withLectures, funnelCourse, funnel } = data;

  // Links keep the current range, search and course; each control changes only its own part.
  const rangeParams = preset ? { range: preset } : { from: range.from, to: range.to };
  const params = { ...rangeParams, q: q || undefined, course: courseParam || undefined };
  const sum = (key: "revenue" | "orders" | "signups" | "watchSeconds") => series.reduce((t, d) => t + d[key], 0);
  const per = BUCKET_WORD[bucket];

  const needle = q.toLowerCase();
  const matches = (...fields: string[]) => !needle || fields.some((f) => f.toLowerCase().includes(needle));
  const courseRows = catalogue.filter((c) => matches(c.title, c.category, c.id))
    .map((c) => ({ course: c, ...courses[c.id] }))
    .sort((a, b) => b.revenue - a.revenue || b.learners - a.learners || b.owners - a.owners);
  const bookRows = BOOKS.filter((b) => matches(b.title, b.subtitle, b.category, b.id))
    .map((b) => ({ book: b, ...books[b.id] }))
    .sort((a, b) => b.revenue - a.revenue || b.sales - a.sales);
  const firstStarted = funnel[0]?.started ?? 0;

  return (
    <>
      <AdminHeading title="Analytics" intro="Sales, sign-ups and what members actually watch. Days are UTC." />

      {/* Range controls: everything down to the course tables follows them. */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Segmented
          base="/admin/analytics"
          params={{ q: q || undefined, course: courseParam || undefined }}
          name="range"
          options={PRESETS}
          value={preset}
        />
        <form action="/admin/analytics" className="flex flex-wrap items-center gap-2">
          {q ? <input type="hidden" name="q" value={q} /> : null}
          {courseParam ? <input type="hidden" name="course" value={courseParam} /> : null}
          <label className="sr-only" htmlFor="from">
            From
          </label>
          <input
            id="from"
            type="date"
            name="from"
            required
            defaultValue={range.from}
            max={today()}
            className={`${INPUT} w-auto py-2 text-[13.5px] [color-scheme:dark] ${preset ? "" : "border-neon/60"}`}
          />
          <span className="text-[13px] text-white/45">to</span>
          <label className="sr-only" htmlFor="to">
            To
          </label>
          <input
            id="to"
            type="date"
            name="to"
            required
            defaultValue={range.to}
            max={today()}
            className={`${INPUT} w-auto py-2 text-[13.5px] [color-scheme:dark] ${preset ? "" : "border-neon/60"}`}
          />
          <button type="submit" className={BUTTON_QUIET}>
            Apply
          </button>
        </form>
      </div>

      <p className="-mt-2 mb-5 text-[13.5px] text-white/55">
        {rangeLabel(range)} · {days} day{days === 1 ? "" : "s"}
        {bucket === "day" ? "" : ` · charts grouped by ${per}`}
      </p>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Revenue" value={money(sum("revenue"))} hint={`${compact(sum("orders"))} paid orders`} />
        <StatTile label="New members" value={compact(sum("signups"))} hint={`Over ${days} day${days === 1 ? "" : "s"}`} />
        <StatTile label="Watch time" value={watchTime(sum("watchSeconds"))} hint="Time spent playing lectures" />
        <StatTile label="Active learners" value={compact(learners)} hint="Played a lecture in this range" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title={`Revenue per ${per}`}>
          <ColumnChart data={series.map((d) => ({ day: d.day, value: d.revenue }))} kind="money" label="Revenue" bucket={bucket} />
        </Card>
        <Card title={`New members per ${per}`}>
          <ColumnChart data={series.map((d) => ({ day: d.day, value: d.signups }))} kind="count" label="New members" bucket={bucket} />
        </Card>
        <Card title={`Watch time per ${per}`}>
          <ColumnChart data={series.map((d) => ({ day: d.day, value: d.watchSeconds }))} kind="minutes" label="Watch time" bucket={bucket} />
        </Card>
        <Card title={`Active learners per ${per}`} description={`Members who played any lecture that ${per}.`}>
          <ColumnChart
            data={series.map((d) => ({ day: d.day, value: d.learners }))}
            kind="count"
            label="Learners"
            bucket={bucket}
            showTotal={false}
          />
        </Card>
      </div>

      <div className="mb-4 mt-12 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[20px] font-extrabold text-white">
          Courses &amp; books <span className="text-[14px] font-semibold text-white/45">all time</span>
        </h2>
        <SearchBox base="/admin/analytics" params={params} placeholder="Search courses and books" />
      </div>

      <Card flush>
        <PagedTable
          key={q}
          head={
            <tr>
              <th className={TH}>Course</th>
              <th className={`${TH} text-right`}>Owners</th>
              <th className={`${TH} text-right`}>Revenue</th>
              <th className={`${TH} text-right`}>Lectures</th>
              <th className={`${TH} text-right`}>Learners</th>
              <th className={`${TH} w-[180px]`}>Finished</th>
              <th className={`${TH} text-right`}>Watch time</th>
            </tr>
          }
          rows={courseRows.map((r) => (
            <tr key={r.course.id}>
              <td className={TD}>
                <Link href={`/admin/courses/${r.course.id}`} className="font-semibold text-white hover:underline">
                  {r.course.title}
                </Link>
                <span className="block text-[12.5px] text-white/45">{r.course.price}</span>
              </td>
              <td className={`${TD} text-right`}>{r.course.price === "Included" ? <Badge>Everyone</Badge> : r.owners}</td>
              <td className={`${TD} text-right`}>{money(r.revenue)}</td>
              <td className={`${TD} text-right`}>
                {r.published}
                {r.lectures > r.published ? <span className="text-white/40"> +{r.lectures - r.published} draft</span> : null}
              </td>
              <td className={`${TD} text-right`}>{r.learners}</td>
              <td className={TD}>
                {r.learners ? <Meter value={(r.finishers / r.learners) * 100} label={`${r.finishers}`} /> : <span className="text-white/35">—</span>}
              </td>
              <td className={`${TD} text-right`}>{r.watchSeconds ? watchTime(r.watchSeconds) : "—"}</td>
            </tr>
          ))}
          empty={<Empty>No courses match “{q}”.</Empty>}
        />
        <p className="border-t border-white/[0.06] px-5 py-3 text-[12.5px] text-white/45 sm:px-6">
          Learners started at least one lecture. Finished means they completed every published lecture; the bar is the share of learners.
        </p>
      </Card>

      <div className="mt-6">
        <Card flush>
          <PagedTable
            key={q}
            head={
              <tr>
                <th className={TH}>Book</th>
                <th className={`${TH} text-right`}>Price</th>
                <th className={`${TH} text-right`}>Copies</th>
                <th className={`${TH} text-right`}>Revenue</th>
              </tr>
            }
            rows={bookRows.map((r) => (
              <tr key={r.book.id}>
                <td className={`${TD} font-semibold text-white`}>{r.book.title}</td>
                <td className={`${TD} text-right`}>{r.book.price}</td>
                <td className={`${TD} text-right`}>{r.sales}</td>
                <td className={`${TD} text-right`}>{money(r.revenue)}</td>
              </tr>
            ))}
            empty={<Empty>No books match “{q}”.</Empty>}
          />
        </Card>
      </div>

      <h2 className="mb-4 mt-12 text-[20px] font-extrabold text-white">
        Lecture drop-off <span className="text-[14px] font-semibold text-white/45">all time</span>
      </h2>

      {withLectures.length && funnelCourse ? (
        <Card
          title={funnelCourse.title}
          description="How many members start each lecture, and how far they get."
          action={
            withLectures.length > 1 ? (
              <form action="/admin/analytics" className="flex gap-2">
                {Object.entries({ ...rangeParams, q: q || undefined }).map(([k, v]) =>
                  v ? <input key={k} type="hidden" name={k} value={v} /> : null,
                )}
                <select
                  name="course"
                  defaultValue={funnelCourse.id}
                  aria-label="Course"
                  className="rounded-full border border-white/15 bg-[#121514] px-3 py-1.5 text-[13px] text-white [color-scheme:dark] [&_option]:bg-[#121514] [&_option]:text-white"
                >
                  {withLectures.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <button type="submit" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/70 ring-1 ring-white/15 hover:text-white">
                  Show
                </button>
              </form>
            ) : null
          }
          flush
        >
          <PagedTable
            head={
              <tr>
                <th className={TH}>Lecture</th>
                <th className={`${TH} text-right`}>Started</th>
                <th className={`${TH} w-[170px]`}>Kept from lecture 1</th>
                <th className={`${TH} w-[170px]`}>Completed</th>
                <th className={`${TH} w-[170px]`}>Avg. watched</th>
                <th className={`${TH} text-right`}>Watch time</th>
              </tr>
            }
            rows={funnel.map((l) => (
              <tr key={l.id}>
                <td className={TD}>
                  <span className="font-semibold text-white">
                    {l.position}. {l.title}
                  </span>
                  {l.published ? null : (
                    <span className="ml-2">
                      <Badge tone="warn">Draft</Badge>
                    </span>
                  )}
                </td>
                <td className={`${TD} text-right`}>{l.started}</td>
                <td className={TD}>
                  {firstStarted ? <Meter value={(l.started / firstStarted) * 100} /> : <span className="text-white/35">—</span>}
                </td>
                <td className={TD}>
                  {l.started ? <Meter value={(l.completed / l.started) * 100} label={percent(l.completed, l.started)} /> : <span className="text-white/35">—</span>}
                </td>
                <td className={TD}>{l.started ? <Meter value={l.avgPercent} /> : <span className="text-white/35">—</span>}</td>
                <td className={`${TD} text-right`}>{l.watchSeconds ? watchTime(l.watchSeconds) : "—"}</td>
              </tr>
            ))}
          />
        </Card>
      ) : (
        <Card>
          <Empty>Add lectures to a course to see how members move through it.</Empty>
        </Card>
      )}
    </>
  );
}
