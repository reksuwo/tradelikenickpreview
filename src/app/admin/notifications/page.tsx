import type { Metadata } from "next";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { LoadError } from "@/components/admin/admin-parts";
import { AdminHeading, BUTTON, Badge, Card, Empty, INPUT, LABEL, Pagination, SELECT, SearchBox, dateTime } from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin";
import { deleteNotification, sendNotification } from "@/lib/admin-actions";
import { PAGE_SIZE, sentNotifications } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Notifications" };

const KIND_LABELS: Record<string, string> = { announcement: "Announcement", course: "New content", live: "Live session" };

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

export default async function AdminNotifications({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let sent;
  try {
    sent = await sentNotifications({ q, page });
  } catch (error) {
    return <LoadError error={error} />;
  }
  const params = { q: q || undefined, page };

  return (
    <>
      <AdminHeading title="Notifications" intro="Post to the bell in every member's header, or to one member. Purchase receipts are sent automatically and aren't listed here." />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card title="New notification">
          <ActionForm action={sendNotification} resetOnSuccess className="space-y-4">
            <div>
              <label htmlFor="kind" className={LABEL}>
                Type
              </label>
              <select id="kind" name="kind" defaultValue="announcement" className={SELECT}>
                {Object.entries(KIND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="title" className={LABEL}>
                Title
              </label>
              <input id="title" name="title" required minLength={3} maxLength={120} placeholder="Live Q&A this Thursday at 4pm ET" className={INPUT} />
            </div>
            <div>
              <label htmlFor="body" className={LABEL}>
                Message <span className="font-normal text-white/40">(optional)</span>
              </label>
              <textarea id="body" name="body" rows={3} maxLength={500} className={INPUT} />
            </div>
            <div>
              <label htmlFor="href" className={LABEL}>
                Link <span className="font-normal text-white/40">(optional)</span>
              </label>
              <input id="href" name="href" placeholder="/browse/live" className={INPUT} />
            </div>
            <div>
              <label htmlFor="to" className={LABEL}>
                Send to
              </label>
              <input id="to" name="to" type="email" placeholder="Everyone (or one member's email)" className={INPUT} />
              <p className="mt-1 text-[12.5px] text-white/40">Leave empty to send to every current member.</p>
            </div>
            <Submit className={BUTTON} pending="Sending…">
              Send notification
            </Submit>
          </ActionForm>
        </Card>

        <Card
          title="Sent"
          description={`${sent.total.toLocaleString()} ${q ? "matching" : "in total"}, newest first.`}
          flush
        >
          <div className="px-5 sm:px-6">
            <SearchBox base="/admin/notifications" params={params} placeholder="Search title, message or email" />
          </div>
          {sent.rows.length ? (
            <ul className="mt-3 border-t border-white/[0.06]">
              {sent.rows.map((n) => (
                <li key={n.id} className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-3.5 last:border-0 sm:px-6">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-[14.5px] font-semibold text-white">{n.title}</span>
                      <Badge>{KIND_LABELS[n.kind] ?? n.kind}</Badge>
                    </p>
                    {n.body ? <p className="mt-0.5 text-[13.5px] text-white/60">{n.body}</p> : null}
                    <p className="mt-1 text-[12.5px] text-white/40">
                      {dateTime(n.createdAt)} · {n.email ? `To ${n.email}` : "Everyone"}
                      {n.href ? ` · ${n.href}` : ""}
                    </p>
                  </div>
                  <ActionForm action={deleteNotification} confirm="Delete this notification? Members will stop seeing it." className="shrink-0">
                    <input type="hidden" name="id" value={n.id} />
                    <Submit className="text-[13px] font-semibold text-white/45 hover:text-[#ff9384]" pending="…">
                      Delete
                    </Submit>
                  </ActionForm>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>{q ? `Nothing matches “${q}”.` : "Nothing sent yet."}</Empty>
          )}
          <Pagination base="/admin/notifications" params={params} page={page} total={sent.total} pageSize={PAGE_SIZE} />
        </Card>
      </div>
    </>
  );
}
