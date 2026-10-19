import "server-only";
import { BOOKS } from "./books";
import { getAllCourses } from "./course-store";
import { db } from "./db";

/**
 * Read queries for the admin panel. Callers must have checked requireAdmin():
 * these run over the owner connection and see every member's data.
 *
 * Days are UTC calendar days. Revenue counts paid Stripe orders that haven't
 * been refunded; grants are free and excluded.
 */

/** Rows per page in every admin table. */
export const PAGE_SIZE = 10;

const paid = () => db`source = 'stripe' and refunded_at is null`;

/** Escapes a search term for ilike. */
function like(q: string) {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

const memberName = () => db`
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1))
`;

// ─── Overview ─────────────────────────────────────────────────────────

export type Overview = {
  revenueAll: number;
  revenue30: number;
  revenuePrev30: number;
  orders30: number;
  members: number;
  members30: number;
  learners7: number;
  watchSeconds30: number;
};

export async function overview(): Promise<Overview> {
  const [row] = await db<Overview[]>`
    select
      (select coalesce(sum(amount_cents), 0)::float8 from public.purchases where ${paid()}) as "revenueAll",
      (select coalesce(sum(amount_cents), 0)::float8 from public.purchases
        where ${paid()} and created_at >= now() - interval '30 days') as "revenue30",
      (select coalesce(sum(amount_cents), 0)::float8 from public.purchases
        where ${paid()} and created_at >= now() - interval '60 days' and created_at < now() - interval '30 days') as "revenuePrev30",
      (select count(*)::int from public.purchases where ${paid()} and created_at >= now() - interval '30 days') as "orders30",
      (select count(*)::int from auth.users) as members,
      (select count(*)::int from auth.users where created_at >= now() - interval '30 days') as "members30",
      (select count(distinct user_id)::int from public.watch_activity where day > current_date - 7) as "learners7",
      (select coalesce(sum(seconds), 0)::float8 from public.watch_activity where day > current_date - 30) as "watchSeconds30"
  `;
  return row;
}

/** How the charts group a date range: by day up to ~3 months, then by week, then by month. */
export type Bucket = "day" | "week" | "month";

/** An inclusive range of UTC days, as YYYY-MM-DD. */
export type DateRange = { from: string; to: string };

export function addDays(day: string, n: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

/** The last `n` days, today included. */
export function lastDays(n: number): DateRange {
  const to = today();
  return { from: addDays(to, -(n - 1)), to };
}

/** Days in a range, both ends included. */
export function spanDays({ from, to }: DateRange) {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1;
}

export function bucketFor(range: DateRange): Bucket {
  const days = spanDays(range);
  return days <= 92 ? "day" : days <= 400 ? "week" : "month";
}

/**
 * One row per day, week or month in the range, oldest first, for the charts.
 * `day` is the YYYY-MM-DD the bucket starts on (weeks start on Monday).
 * `learners` counts each member once per bucket.
 */
export type Day = {
  day: string;
  revenue: number;
  orders: number;
  signups: number;
  watchSeconds: number;
  learners: number;
};

export async function daily({ from, to }: DateRange, bucket: Bucket = "day"): Promise<Day[]> {
  const step = `1 ${bucket}`;
  return db<Day[]>`
    with d as (
      select generate_series(date_trunc(${bucket}, ${from}::date), ${to}::date, ${step}::interval)::date as day
    ),
    p as (
      select date_trunc(${bucket}, created_at)::date as day, sum(amount_cents)::float8 as revenue, count(*)::int as orders
      from public.purchases
      where ${paid()} and created_at >= ${from}::date and created_at < ${to}::date + 1
      group by 1
    ),
    s as (
      select date_trunc(${bucket}, created_at)::date as day, count(*)::int as signups
      from auth.users where created_at >= ${from}::date and created_at < ${to}::date + 1
      group by 1
    ),
    w as (
      select date_trunc(${bucket}, day)::date as day, sum(seconds)::float8 as watch, count(distinct user_id)::int as learners
      from public.watch_activity where day between ${from}::date and ${to}::date
      group by 1
    )
    select to_char(d.day, 'YYYY-MM-DD') as day,
           coalesce(p.revenue, 0) as revenue, coalesce(p.orders, 0) as orders,
           coalesce(s.signups, 0) as signups,
           coalesce(w.watch, 0) as "watchSeconds", coalesce(w.learners, 0) as learners
    from d
    left join p on p.day = d.day
    left join s on s.day = d.day
    left join w on w.day = d.day
    order by d.day
  `;
}

/** Members who played any lecture in the range, each counted once. */
export async function activeLearners({ from, to }: DateRange) {
  const [row] = await db<{ n: number }[]>`
    select count(distinct user_id)::int as n from public.watch_activity where day between ${from}::date and ${to}::date
  `;
  return row.n;
}

// ─── Orders ───────────────────────────────────────────────────────────

export type Order = {
  id: string;
  userId: string;
  email: string;
  name: string;
  productType: "course" | "book";
  productId: string;
  title: string;
  amountCents: number;
  currency: string;
  source: "stripe" | "grant";
  paymentIntent: string | null;
  refundedAt: Date | null;
  createdAt: Date;
};

const orderColumns = () => db`
  p.id, p.user_id as "userId", u.email, ${memberName()} as name,
  p.product_type as "productType", p.product_id as "productId", p.title,
  p.amount_cents as "amountCents", p.currency, p.source, p.stripe_payment_intent as "paymentIntent",
  p.refunded_at as "refundedAt", p.created_at as "createdAt"
`;

export type OrderFilter = { q?: string; type?: string; status?: string; page?: number };

export async function listOrders({ q = "", type = "", status = "", page = 1 }: OrderFilter) {
  const where = db`
    where true
    ${q ? db`and (u.email ilike ${like(q)} or p.title ilike ${like(q)})` : db``}
    ${type === "course" || type === "book" ? db`and p.product_type = ${type}` : db``}
    ${
      status === "paid"
        ? db`and p.source = 'stripe' and p.refunded_at is null`
        : status === "refunded"
          ? db`and p.refunded_at is not null`
          : status === "grant"
            ? db`and p.source = 'grant'`
            : db``
    }
  `;
  const [rows, [{ total }]] = await Promise.all([
    db<Order[]>`
      select ${orderColumns()} from public.purchases p join auth.users u on u.id = p.user_id
      ${where}
      order by p.created_at desc
      limit ${PAGE_SIZE} offset ${(Math.max(1, page) - 1) * PAGE_SIZE}
    `,
    db<{ total: number }[]>`
      select count(*)::int as total from public.purchases p join auth.users u on u.id = p.user_id ${where}
    `,
  ]);
  return { rows, total };
}

export async function recentOrders(limit = 8) {
  return db<Order[]>`
    select ${orderColumns()} from public.purchases p join auth.users u on u.id = p.user_id
    order by p.created_at desc limit ${limit}
  `;
}

export async function getOrder(id: string) {
  const [row] = await db<Order[]>`
    select ${orderColumns()} from public.purchases p join auth.users u on u.id = p.user_id where p.id = ${id}
  `;
  return row ?? null;
}

// ─── Members ──────────────────────────────────────────────────────────

export type MemberRow = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: Date;
  lastSignInAt: Date | null;
  confirmed: boolean;
  provider: string | null;
  orders: number;
  spentCents: number;
  lastWatchedAt: Date | null;
};

const memberColumns = () => db`
  u.id, u.email, ${memberName()} as name, coalesce('/api/avatars/' || (u.raw_user_meta_data->>'photo'), u.raw_user_meta_data->>'avatar_url') as "avatarUrl",
  u.created_at as "createdAt", u.last_sign_in_at as "lastSignInAt",
  u.email_confirmed_at is not null as confirmed, u.raw_app_meta_data->>'provider' as provider,
  coalesce(o.orders, 0) as orders, coalesce(o.spent, 0) as "spentCents", w.last as "lastWatchedAt"
`;

const memberJoins = () => db`
  left join lateral (
    select count(*)::int as orders,
           coalesce(sum(amount_cents) filter (where source = 'stripe' and refunded_at is null), 0)::float8 as spent
    from public.purchases where user_id = u.id
  ) o on true
  left join lateral (select max(updated_at) as last from public.lecture_progress where user_id = u.id) w on true
`;

export async function listMembers({ q = "", page = 1 }: { q?: string; page?: number }) {
  const where = q
    ? db`where u.email ilike ${like(q)} or ${memberName()} ilike ${like(q)}`
    : db``;
  const [rows, [{ total }]] = await Promise.all([
    db<MemberRow[]>`
      select ${memberColumns()} from auth.users u ${memberJoins()}
      ${where}
      order by u.created_at desc
      limit ${PAGE_SIZE} offset ${(Math.max(1, page) - 1) * PAGE_SIZE}
    `,
    db<{ total: number }[]>`select count(*)::int as total from auth.users u ${where}`,
  ]);
  return { rows, total };
}

export async function getMemberRow(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db<MemberRow[]>`select ${memberColumns()} from auth.users u ${memberJoins()} where u.id = ${id}`;
  return row ?? null;
}

export async function memberOrders(userId: string) {
  return db<Order[]>`
    select ${orderColumns()} from public.purchases p join auth.users u on u.id = p.user_id
    where p.user_id = ${userId} order by p.created_at desc
  `;
}

/** How far one member is through each course they've started. */
export type MemberCourseProgress = {
  courseId: string;
  lectures: number;
  started: number;
  completed: number;
  watchedSeconds: number;
  lastWatchedAt: Date;
};

export async function memberProgress(userId: string) {
  return db<MemberCourseProgress[]>`
    select l.course_id as "courseId",
           (select count(*)::int from public.lectures x where x.course_id = l.course_id and x.published) as lectures,
           count(*)::int as started,
           count(p.completed_at)::int as completed,
           sum(p.watched_seconds)::float8 as "watchedSeconds",
           max(p.updated_at) as "lastWatchedAt"
    from public.lecture_progress p join public.lectures l on l.id = p.lecture_id
    where p.user_id = ${userId}
    group by l.course_id
    order by max(p.updated_at) desc
  `;
}

// ─── Courses & books ──────────────────────────────────────────────────

export type CourseStats = {
  courseId: string;
  owners: number;
  revenue: number;
  lectures: number;
  published: number;
  learners: number;
  finishers: number;
  watchSeconds: number;
};

/** Sales, lectures and learning for every course in the catalogue. */
export async function courseStats(): Promise<Record<string, CourseStats>> {
  const [courses, sales, lectures, learning] = await Promise.all([
    getAllCourses(),
    db<{ courseId: string; owners: number; revenue: number }[]>`
      select product_id as "courseId", count(distinct user_id)::int as owners,
             coalesce(sum(amount_cents) filter (where source = 'stripe'), 0)::float8 as revenue
      from public.purchases where product_type = 'course' and refunded_at is null
      group by product_id
    `,
    db<{ courseId: string; lectures: number; published: number }[]>`
      select course_id as "courseId", count(*)::int as lectures, count(*) filter (where published)::int as published
      from public.lectures group by course_id
    `,
    // A finisher has completed every published lecture of the course.
    db<{ courseId: string; learners: number; finishers: number; watchSeconds: number }[]>`
      with per_member as (
        select l.course_id, p.user_id, count(p.completed_at) filter (where l.published) as done,
               sum(p.watched_seconds) as watched
        from public.lecture_progress p join public.lectures l on l.id = p.lecture_id
        group by l.course_id, p.user_id
      ),
      totals as (select course_id, count(*) filter (where published) as published from public.lectures group by course_id)
      select m.course_id as "courseId", count(*)::int as learners,
             count(*) filter (where t.published > 0 and m.done >= t.published)::int as finishers,
             coalesce(sum(m.watched), 0)::float8 as "watchSeconds"
      from per_member m join totals t on t.course_id = m.course_id
      group by m.course_id
    `,
  ]);

  const stats: Record<string, CourseStats> = {};
  for (const c of courses) {
    stats[c.id] = { courseId: c.id, owners: 0, revenue: 0, lectures: 0, published: 0, learners: 0, finishers: 0, watchSeconds: 0 };
  }
  for (const r of [...sales, ...lectures, ...learning]) {
    if (stats[r.courseId]) Object.assign(stats[r.courseId], r);
  }
  return stats;
}

export type BookStats = { bookId: string; sales: number; revenue: number };

export async function bookStats(): Promise<Record<string, BookStats>> {
  const rows = await db<BookStats[]>`
    select product_id as "bookId", count(*)::int as sales,
           coalesce(sum(amount_cents) filter (where source = 'stripe'), 0)::float8 as revenue
    from public.purchases where product_type = 'book' and refunded_at is null
    group by product_id
  `;
  const stats: Record<string, BookStats> = Object.fromEntries(BOOKS.map((b) => [b.id, { bookId: b.id, sales: 0, revenue: 0 }]));
  for (const r of rows) if (stats[r.bookId]) stats[r.bookId] = r;
  return stats;
}

/** Per lecture of one course: how many started it, finished it, and how far they got on average. */
export type LectureFunnel = {
  id: string;
  position: number;
  title: string;
  published: boolean;
  seconds: number;
  started: number;
  completed: number;
  avgPercent: number;
  watchSeconds: number;
};

export async function lectureFunnel(courseId: string) {
  return db<LectureFunnel[]>`
    select l.id, l.position, l.title, l.published, l.seconds,
           count(p.user_id)::int as started,
           count(p.completed_at)::int as completed,
           coalesce(round(avg(case when p.user_id is null then null
                                   when p.completed_at is not null then 100
                                   when l.seconds > 0 then least(100, p.furthest_seconds * 100.0 / l.seconds) end)), 0)::int as "avgPercent",
           coalesce(sum(p.watched_seconds), 0)::float8 as "watchSeconds"
    from public.lectures l
    left join public.lecture_progress p on p.lecture_id = l.id
    where l.course_id = ${courseId}
    group by l.id
    order by l.position, l.created_at
  `;
}

/** Members who have started a course, most recent first. */
export type CourseLearner = {
  userId: string;
  email: string;
  name: string;
  completed: number;
  watchedSeconds: number;
  lastWatchedAt: Date;
};

export async function courseLearners(courseId: string, { q = "", limit = 500 }: { q?: string; limit?: number } = {}) {
  return db<CourseLearner[]>`
    select p.user_id as "userId", u.email, ${memberName()} as name,
           count(p.completed_at) filter (where l.published)::int as completed,
           sum(p.watched_seconds)::float8 as "watchedSeconds",
           max(p.updated_at) as "lastWatchedAt"
    from public.lecture_progress p
    join public.lectures l on l.id = p.lecture_id
    join auth.users u on u.id = p.user_id
    where l.course_id = ${courseId}
    ${q ? db`and (u.email ilike ${like(q)} or ${memberName()} ilike ${like(q)})` : db``}
    group by p.user_id, u.id
    order by max(p.updated_at) desc
    limit ${limit}
  `;
}

// ─── Notifications ────────────────────────────────────────────────────

export type SentNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  href: string | null;
  email: string | null;
  createdAt: Date;
};

/** Notifications sent by hand or by publishing, newest first. Purchase receipts are left out. */
export async function sentNotifications({ q = "", page = 1 }: { q?: string; page?: number }) {
  const where = db`
    where n.kind <> 'purchase'
    ${q ? db`and (n.title ilike ${like(q)} or n.body ilike ${like(q)} or u.email ilike ${like(q)})` : db``}
  `;
  const [rows, [{ total }]] = await Promise.all([
    db<SentNotification[]>`
      select n.id, n.kind, n.title, n.body, n.href, u.email, n.created_at as "createdAt"
      from public.notifications n left join auth.users u on u.id = n.user_id
      ${where}
      order by n.created_at desc
      limit ${PAGE_SIZE} offset ${(Math.max(1, page) - 1) * PAGE_SIZE}
    `,
    db<{ total: number }[]>`
      select count(*)::int as total from public.notifications n left join auth.users u on u.id = n.user_id ${where}
    `,
  ]);
  return { rows, total };
}

/** Lectures whose title or description matches, across every course. */
export async function searchLectures(q: string, limit = 50) {
  return db<{ id: string; courseId: string; position: number; title: string; published: boolean }[]>`
    select id, course_id as "courseId", position, title, published from public.lectures
    where title ilike ${like(q)} or description ilike ${like(q)}
    order by course_id, position
    limit ${limit}
  `;
}
