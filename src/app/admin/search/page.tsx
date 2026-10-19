import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "@/components/account/avatar";
import { LoadError, OrderStatus } from "@/components/admin/admin-parts";
import { AdminHeading, Badge, Card, Empty, SearchBox, ago, date } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin";
import { listMembers, listOrders, searchLectures, sentNotifications } from "@/lib/admin-data";
import { BOOKS } from "@/lib/books";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = { title: "Search" };

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const ROW = "flex items-center justify-between gap-4 border-b border-white/[0.06] px-5 py-3 transition-colors last:border-0 hover:bg-white/[0.03] sm:px-6";

/** One group of results, with a link to the full, searchable list when there are more. */
function Section({ title, total, more, children }: { title: string; total: number; more?: string; children: ReactNode }) {
  return (
    <Card
      title={`${title} (${total.toLocaleString()})`}
      flush
      action={
        more && total > 10 ? (
          <Link href={more} className="text-[13.5px] font-semibold text-white/60 hover:text-white">
            See all →
          </Link>
        ) : null
      }
    >
      {total ? <ul>{children}</ul> : <Empty>No matches.</Empty>}
    </Card>
  );
}

/** Searches every part of the admin panel at once; each section shows its first ten matches. */
export default async function AdminSearch({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  if (!q) {
    return (
      <>
        <AdminHeading title="Search" intro="Find members, orders, courses, lectures and notifications." />
        <SearchBox base="/admin/search" params={{}} placeholder="Search everything" />
      </>
    );
  }

  let results;
  try {
    const [members, orders, lectures, notifications] = await Promise.all([
      listMembers({ q }),
      listOrders({ q }),
      searchLectures(q, 10),
      sentNotifications({ q }),
    ]);
    results = { members, orders, lectures, notifications };
  } catch (error) {
    return <LoadError error={error} />;
  }
  const { members, orders, lectures, notifications } = results;

  const needle = q.toLowerCase();
  const courses = COURSES.filter((c) => [c.title, c.category, c.id].some((f) => f.toLowerCase().includes(needle)));
  const books = BOOKS.filter((b) => [b.title, b.subtitle, b.id].some((f) => f.toLowerCase().includes(needle)));
  const query = `?q=${encodeURIComponent(q)}`;

  return (
    <>
      <AdminHeading title={`Results for “${q}”`} />
      <div className="mb-6">
        <SearchBox base="/admin/search" params={{ q }} placeholder="Search everything" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Members" total={members.total} more={`/admin/members${query}`}>
          {members.rows.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/members/${m.id}`} className={ROW}>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={m.name} src={m.avatarUrl ?? undefined} className="size-8 rounded-lg text-[12px]" />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-semibold text-white">{m.name}</span>
                    <span className="block truncate text-[12.5px] text-white/45">{m.email}</span>
                  </span>
                </span>
                <span className="shrink-0 text-[12.5px] text-white/45">Joined {date(m.createdAt)}</span>
              </Link>
            </li>
          ))}
        </Section>

        <Section title="Orders" total={orders.total} more={`/admin/orders${query}`}>
          {orders.rows.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/members/${o.userId}`} className={ROW}>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{o.title}</span>
                  <span className="block truncate text-[12.5px] text-white/45">
                    {o.email} · {ago(o.createdAt)}
                  </span>
                </span>
                <span className="shrink-0 text-[13.5px] tabnum">
                  <OrderStatus order={o} />
                </span>
              </Link>
            </li>
          ))}
        </Section>

        <Section title="Courses & lectures" total={courses.length + lectures.length} more={`/admin/courses${query}`}>
          {courses.slice(0, 10).map((c) => (
            <li key={c.id}>
              <Link href={`/admin/courses/${c.id}`} className={ROW}>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{c.title}</span>
                  <span className="text-[12.5px] text-white/45">
                    Course · {c.category} · {c.price}
                  </span>
                </span>
              </Link>
            </li>
          ))}
          {lectures.map((l) => (
            <li key={l.id}>
              <Link href={`/admin/courses/${l.courseId}/lectures/${l.id}`} className={ROW}>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">
                    {l.position}. {l.title}
                  </span>
                  <span className="text-[12.5px] text-white/45">
                    Lecture · {COURSES.find((c) => c.id === l.courseId)?.title ?? l.courseId}
                  </span>
                </span>
                {l.published ? null : <Badge tone="warn">Draft</Badge>}
              </Link>
            </li>
          ))}
        </Section>

        <Section title="Books" total={books.length} more={`/admin/analytics${query}`}>
          {books.slice(0, 10).map((b) => (
            <li key={b.id}>
              <Link href={`/admin/analytics${query}`} className={ROW}>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{b.title}</span>
                  <span className="text-[12.5px] text-white/45">
                    {b.category} · {b.price}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Section>

        <Section title="Notifications" total={notifications.total} more={`/admin/notifications${query}`}>
          {notifications.rows.map((n) => (
            <li key={n.id}>
              <Link href={`/admin/notifications${query}`} className={ROW}>
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-white">{n.title}</span>
                  <span className="block truncate text-[12.5px] text-white/45">
                    {n.email ? `To ${n.email}` : "Everyone"} · {ago(n.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Section>
      </div>
    </>
  );
}
