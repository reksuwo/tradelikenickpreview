import type { Metadata } from "next";
import Link from "next/link";
import { notFound, unstable_rethrow } from "next/navigation";
import { Avatar } from "@/components/account/avatar";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { LoadError, OrderStatus } from "@/components/admin/admin-parts";
import {
  BUTTON,
  BUTTON_DANGER,
  BUTTON_QUIET,
  Badge,
  Card,
  Empty,
  INPUT,
  LABEL,
  Meter,
  SELECT,
  StatTile,
  TD,
  TH,
  ago,
  date,
  money,
  watchTime,
} from "@/components/admin/admin-ui";
import { PagedList, PagedTable } from "@/components/admin/paged";
import { requireAdmin } from "@/lib/admin";
import { grantAccess, refundOrder, revokeGrant, sendNotification } from "@/lib/admin-actions";
import { getMemberRow, memberOrders, memberProgress } from "@/lib/admin-data";
import { BOOKS } from "@/lib/books";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = { title: "Member" };

type Props = { params: Promise<{ id: string }> };

export default async function AdminMember({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  let data;
  try {
    const member = await getMemberRow(id);
    if (!member) notFound();
    const [orders, progress] = await Promise.all([memberOrders(member.id), memberProgress(member.id)]);
    data = { member, orders, progress };
  } catch (error) {
    unstable_rethrow(error);
    return <LoadError error={error} />;
  }
  const { member, orders, progress } = data;

  const owned = new Set(orders.filter((o) => !o.refundedAt).map((o) => `${o.productType}:${o.productId}`));
  const watched = progress.reduce((t, p) => t + p.watchedSeconds, 0);

  return (
    <>
      <Link href="/admin/members" className="text-[14px] font-semibold text-white/55 hover:text-white">
        ← Members
      </Link>

      <div className="mb-8 mt-4 flex flex-wrap items-center gap-4">
        <Avatar name={member.name} src={member.avatarUrl ?? undefined} className="size-16 rounded-2xl text-[22px]" />
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold leading-tight text-white">
            {member.name}
            {member.confirmed ? null : <Badge tone="warn">Email not confirmed</Badge>}
          </h1>
          <p className="mt-1 text-[14.5px] text-white/55">
            {member.email} · Joined {date(member.createdAt)} · Signed in {ago(member.lastSignInAt).toLowerCase()}
            {member.provider && member.provider !== "email" ? ` · ${member.provider[0].toUpperCase()}${member.provider.slice(1)} sign-in` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Spent" value={money(member.spentCents)} hint="Paid, after refunds" />
        <StatTile label="Orders" value={String(member.orders)} hint="Including given items" />
        <StatTile label="Courses started" value={String(progress.length)} hint={progress[0] ? `Last watched ${ago(progress[0].lastWatchedAt).toLowerCase()}` : "Nothing watched yet"} />
        <StatTile label="Watch time" value={watchTime(watched)} hint="All courses" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-6">
          <Card title="Course progress" flush>
            <PagedTable
              empty={<Empty>They haven&apos;t watched any lectures yet.</Empty>}
              head={
                <tr>
                  <th className={TH}>Course</th>
                  <th className={`${TH} w-[200px]`}>Lectures completed</th>
                  <th className={`${TH} text-right`}>Watch time</th>
                  <th className={`${TH} text-right`}>Last watched</th>
                </tr>
              }
              rows={progress.map((p) => (
                <tr key={p.courseId}>
                  <td className={TD}>
                    <Link href={`/admin/courses/${p.courseId}`} className="font-semibold text-white hover:underline">
                      {COURSES.find((c) => c.id === p.courseId)?.title ?? p.courseId}
                    </Link>
                  </td>
                  <td className={TD}>
                    <Meter value={p.lectures ? (p.completed / p.lectures) * 100 : 0} label={`${p.completed}/${p.lectures}`} />
                  </td>
                  <td className={`${TD} text-right`}>{watchTime(p.watchedSeconds)}</td>
                  <td className={`${TD} text-right text-white/55`}>{ago(p.lastWatchedAt)}</td>
                </tr>
              ))}
            />
          </Card>

          <Card title="Orders" description="Refunds go back to their card through Stripe and remove access straight away." flush>
            <PagedList
              empty={<Empty>No orders.</Empty>}
              items={orders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3.5 last:border-0 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-[14.5px] font-semibold text-white">{o.title}</p>
                    <p className="text-[12.5px] text-white/45">
                      {o.productType === "course" ? "Course" : "Book"} · {date(o.createdAt)}
                      {o.refundedAt ? ` · Refunded ${date(o.refundedAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] tabnum">
                      <OrderStatus order={o} />
                    </span>
                    {o.source === "grant" ? (
                      <ActionForm action={revokeGrant} confirm={`Remove ${o.title} from ${member.name}'s library?`} className="flex items-center gap-2">
                        <input type="hidden" name="purchaseId" value={o.id} />
                        <Submit className={BUTTON_QUIET} pending="Removing…">
                          Remove
                        </Submit>
                      </ActionForm>
                    ) : o.refundedAt ? null : (
                      <ActionForm
                        action={refundOrder}
                        confirm={`Refund ${money(o.amountCents, o.currency)} for ${o.title}? ${member.name} loses access straight away.`}
                        className="flex items-center gap-2"
                      >
                        <input type="hidden" name="purchaseId" value={o.id} />
                        <Submit className={BUTTON_DANGER} pending="Refunding…">
                          Refund
                        </Submit>
                      </ActionForm>
                    )}
                  </div>
                </li>
              ))}
            />
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          <Card title="Give access" description="Adds a course or book to their library for free, and lets them know.">
            <ActionForm action={grantAccess} className="space-y-3">
              <input type="hidden" name="userId" value={member.id} />
              <label htmlFor="product" className="sr-only">
                Course or book
              </label>
              <select id="product" name="product" required defaultValue="" className={SELECT}>
                <option value="" disabled>
                  Choose a course or book…
                </option>
                <optgroup label="Courses">
                  {COURSES.filter((c) => c.price !== "Included").map((c) => (
                    <option key={c.id} value={`course:${c.id}`} disabled={owned.has(`course:${c.id}`)}>
                      {c.title}
                      {owned.has(`course:${c.id}`) ? " (owned)" : ""}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Books">
                  {BOOKS.map((b) => (
                    <option key={b.id} value={`book:${b.id}`} disabled={owned.has(`book:${b.id}`)}>
                      {b.title}
                      {owned.has(`book:${b.id}`) ? " (owned)" : ""}
                    </option>
                  ))}
                </optgroup>
              </select>
              <Submit className={BUTTON} pending="Adding…">
                Give access
              </Submit>
            </ActionForm>
          </Card>

          <Card title="Send a notification" description="Shows in their bell. Only they see it.">
            <ActionForm action={sendNotification} resetOnSuccess className="space-y-3">
              <input type="hidden" name="to" value={member.email} />
              <input type="hidden" name="kind" value="announcement" />
              <div>
                <label htmlFor="n-title" className={LABEL}>
                  Title
                </label>
                <input id="n-title" name="title" required minLength={3} maxLength={120} className={INPUT} />
              </div>
              <div>
                <label htmlFor="n-body" className={LABEL}>
                  Message <span className="font-normal text-white/40">(optional)</span>
                </label>
                <textarea id="n-body" name="body" rows={3} maxLength={500} className={INPUT} />
              </div>
              <div>
                <label htmlFor="n-href" className={LABEL}>
                  Link <span className="font-normal text-white/40">(optional)</span>
                </label>
                <input id="n-href" name="href" placeholder="/browse/courses" className={INPUT} />
              </div>
              <Submit className={BUTTON} pending="Sending…">
                Send
              </Submit>
            </ActionForm>
          </Card>
        </div>
      </div>
    </>
  );
}
