import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeading, Badge, Card, Empty, SearchBox, StatTile, TABLE, TD, TH, TableWrap, ago, compact, money, watchTime } from "@/components/admin/admin-ui";
import { ColumnChart } from "@/components/admin/column-chart";
import { requireAdmin } from "@/lib/admin";
import { courseStats, daily, lastDays, overview, recentOrders } from "@/lib/admin-data";
import { COURSES } from "@/lib/courses";
import { LoadError, OrderStatus } from "@/components/admin/admin-parts";

export const metadata: Metadata = { title: "Overview" };

export default async function AdminOverview() {
  await requireAdmin();

  let data;
  try {
    const [stats, days, orders, courses] = await Promise.all([overview(), daily(lastDays(30)), recentOrders(10), courseStats()]);
    data = { stats, days, orders, courses };
  } catch (error) {
    return <LoadError error={error} />;
  }
  const { stats, days, orders, courses } = data;

  const delta = stats.revenuePrev30 ? (stats.revenue30 - stats.revenuePrev30) / stats.revenuePrev30 : null;
  const topCourses = COURSES.map((c) => ({ course: c, ...courses[c.id] }))
    .filter((c) => c.owners || c.learners)
    .sort((a, b) => b.revenue - a.revenue || b.learners - a.learners)
    .slice(0, 10);

  return (
    <>
      <AdminHeading title="Overview" intro="How the site is doing over the last 30 days." />

      <div className="mb-6">
        <SearchBox base="/admin/search" params={{}} placeholder="Search members, orders, courses, lectures, notifications" />
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Revenue, 30 days" value={money(stats.revenue30)} delta={delta} hint={`${money(stats.revenueAll)} all time`} />
        <StatTile label="Orders, 30 days" value={compact(stats.orders30)} hint="Paid orders, refunds excluded" />
        <StatTile label="Members" value={compact(stats.members)} hint={`${compact(stats.members30)} joined in 30 days`} />
        <StatTile label="Active learners, 7 days" value={compact(stats.learners7)} hint={`${watchTime(stats.watchSeconds30)} watched in 30 days`} />
      </div>

      <div className="mt-6">
        <Card
          title="Revenue per day"
          description="Paid orders in the last 30 days, UTC."
          action={
            <Link href="/admin/analytics" className="text-[13.5px] font-semibold text-white/60 hover:text-white">
              Analytics →
            </Link>
          }
        >
          <ColumnChart data={days.map((d) => ({ day: d.day, value: d.revenue }))} kind="money" label="Revenue" />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card
          title="Recent orders"
          flush
          action={
            <Link href="/admin/orders" className="text-[13.5px] font-semibold text-white/60 hover:text-white">
              All orders →
            </Link>
          }
        >
          {orders.length ? (
            <TableWrap>
              <table className={TABLE}>
                <thead>
                  <tr>
                    <th className={TH}>Member</th>
                    <th className={TH}>Item</th>
                    <th className={`${TH} text-right`}>Amount</th>
                    <th className={`${TH} text-right`}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className={TD}>
                        <Link href={`/admin/members/${o.userId}`} className="font-semibold text-white hover:underline">
                          {o.name}
                        </Link>
                        <span className="block truncate text-[12.5px] text-white/45">{o.email}</span>
                      </td>
                      <td className={`${TD} max-w-[220px] truncate`}>{o.title}</td>
                      <td className={`${TD} text-right tabnum`}>
                        <OrderStatus order={o} />
                      </td>
                      <td className={`${TD} whitespace-nowrap text-right text-white/50`}>{ago(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          ) : (
            <Empty>No orders yet.</Empty>
          )}
        </Card>

        <Card
          title="Top courses"
          description="By revenue, then learners."
          flush
          action={
            <Link href="/admin/courses" className="text-[13.5px] font-semibold text-white/60 hover:text-white">
              Courses →
            </Link>
          }
        >
          {topCourses.length ? (
            <ul>
              {topCourses.map((c) => (
                <li key={c.course.id} className="border-b border-white/[0.06] last:border-0">
                  <Link
                    href={`/admin/courses/${c.course.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-white/[0.03] sm:px-6"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-semibold text-white">{c.course.title}</span>
                      <span className="text-[12.5px] text-white/45">
                        {c.owners} owner{c.owners === 1 ? "" : "s"} · {c.learners} learner{c.learners === 1 ? "" : "s"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[14px] font-bold tabnum text-white">
                      {c.course.price === "Included" ? <Badge>Included</Badge> : money(c.revenue)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Sales and learning activity will show here.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
