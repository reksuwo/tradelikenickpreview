import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/account/avatar";
import { LoadError } from "@/components/admin/admin-parts";
import { AdminHeading, Badge, Card, Empty, Pagination, SearchBox, TABLE, TD, TH, TableWrap, ago, date, money } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin";
import { PAGE_SIZE, listMembers } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Members" };

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function AdminMembers({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let result;
  try {
    result = await listMembers({ q, page });
  } catch (error) {
    return <LoadError error={error} />;
  }
  const params = { q: q || undefined, page };

  return (
    <>
      <AdminHeading title="Members" intro={`${result.total.toLocaleString()} ${q ? "matching" : "in total"}. Open one to see their orders and progress, or give them a course.`} />

      <div className="mb-4">
        <SearchBox base="/admin/members" params={params} placeholder="Search by name or email" />
      </div>

      <Card flush>
        {result.rows.length ? (
          <TableWrap>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>Member</th>
                  <th className={TH}>Joined</th>
                  <th className={TH}>Last sign-in</th>
                  <th className={TH}>Last watched</th>
                  <th className={`${TH} text-right`}>Orders</th>
                  <th className={`${TH} text-right`}>Spent</th>
                </tr>
              </thead>
              <tbody className="tabnum">
                {result.rows.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className={TD}>
                      <Link href={`/admin/members/${m.id}`} className="flex items-center gap-3">
                        <Avatar name={m.name} src={m.avatarUrl ?? undefined} className="size-9 rounded-lg text-[13px]" />
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-semibold text-white hover:underline">{m.name}</span>
                            {m.confirmed ? null : <Badge tone="warn">Unconfirmed</Badge>}
                          </span>
                          <span className="block truncate text-[12.5px] text-white/45">{m.email}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${TD} whitespace-nowrap`}>{date(m.createdAt)}</td>
                    <td className={`${TD} whitespace-nowrap text-white/55`}>{ago(m.lastSignInAt)}</td>
                    <td className={`${TD} whitespace-nowrap text-white/55`}>{m.lastWatchedAt ? ago(m.lastWatchedAt) : "—"}</td>
                    <td className={`${TD} text-right`}>{m.orders}</td>
                    <td className={`${TD} text-right font-semibold text-white`}>{m.spentCents ? money(m.spentCents) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <Empty>{q ? `No members match “${q}”.` : "No members yet."}</Empty>
        )}
        <Pagination base="/admin/members" params={params} page={page} total={result.total} pageSize={PAGE_SIZE} />
      </Card>
    </>
  );
}
