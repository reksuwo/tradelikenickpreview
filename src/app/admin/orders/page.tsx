import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm, Submit } from "@/components/admin/action-form";
import { LoadError, OrderStatus } from "@/components/admin/admin-parts";
import {
  AdminHeading,
  BUTTON_DANGER,
  Card,
  Empty,
  Pagination,
  SearchBox,
  Segmented,
  TABLE,
  TD,
  TH,
  TableWrap,
  dateTime,
  money,
} from "@/components/admin/admin-ui";
import { requireAdmin } from "@/lib/admin";
import { refundOrder } from "@/lib/admin-actions";
import { PAGE_SIZE, listOrders } from "@/lib/admin-data";

export const metadata: Metadata = { title: "Orders" };

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const TYPES = [
  { value: "", label: "All" },
  { value: "course", label: "Courses" },
  { value: "book", label: "Books" },
];

const STATUSES = [
  { value: "", label: "Any" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "grant", label: "Given" },
];

/** Stripe's dashboard page for a payment, in test or live mode to match the key. */
function stripeLink(paymentIntent: string) {
  const test = process.env.STRIPE_SECRET_KEY?.startsWith("sk_test") ? "/test" : "";
  return `https://dashboard.stripe.com${test}/payments/${paymentIntent}`;
}

export default async function AdminOrders({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const q = str(sp.q);
  const type = TYPES.some((t) => t.value === sp.type) ? str(sp.type) : "";
  const status = STATUSES.some((s) => s.value === sp.status) ? str(sp.status) : "";
  const page = Math.max(1, Number(sp.page) || 1);

  let result;
  try {
    result = await listOrders({ q, type, status, page });
  } catch (error) {
    return <LoadError error={error} />;
  }
  const params = { q: q || undefined, type: type || undefined, status: status || undefined, page };

  return (
    <>
      <AdminHeading title="Orders" intro="Every purchase and every item given by hand. Refunds go through Stripe and remove access." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBox base="/admin/orders" params={params} placeholder="Search by email or item" />
        <Segmented base="/admin/orders" params={params} name="type" options={TYPES} value={type} />
        <Segmented base="/admin/orders" params={params} name="status" options={STATUSES} value={status} />
      </div>

      <Card flush>
        {result.rows.length ? (
          <TableWrap>
            <table className={TABLE}>
              <thead>
                <tr>
                  <th className={TH}>When</th>
                  <th className={TH}>Member</th>
                  <th className={TH}>Item</th>
                  <th className={`${TH} text-right`}>Amount</th>
                  <th className={`${TH} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="tabnum">
                {result.rows.map((o) => (
                  <tr key={o.id}>
                    <td className={`${TD} whitespace-nowrap text-white/55`}>{dateTime(o.createdAt)}</td>
                    <td className={TD}>
                      <Link href={`/admin/members/${o.userId}`} className="font-semibold text-white hover:underline">
                        {o.name}
                      </Link>
                      <span className="block text-[12.5px] text-white/45">{o.email}</span>
                    </td>
                    <td className={TD}>
                      <span className="block max-w-[260px] truncate">{o.title}</span>
                      <span className="text-[12.5px] text-white/45">{o.productType === "course" ? "Course" : "Book"}</span>
                    </td>
                    <td className={`${TD} text-right`}>
                      <OrderStatus order={o} />
                    </td>
                    <td className={`${TD} text-right`}>
                      <span className="inline-flex items-center justify-end gap-3">
                        {o.paymentIntent ? (
                          <a
                            href={stripeLink(o.paymentIntent)}
                            target="_blank"
                            rel="noreferrer"
                            className="whitespace-nowrap text-[13px] font-semibold text-white/55 hover:text-white"
                          >
                            Stripe ↗
                          </a>
                        ) : null}
                        {o.source === "stripe" && !o.refundedAt ? (
                          <ActionForm
                            action={refundOrder}
                            confirm={`Refund ${money(o.amountCents, o.currency)} to ${o.email} for ${o.title}? They lose access straight away.`}
                            className="flex flex-col items-end gap-1"
                          >
                            <input type="hidden" name="purchaseId" value={o.id} />
                            <Submit className={`${BUTTON_DANGER} px-3 py-1.5 text-[12.5px]`} pending="Refunding…">
                              Refund
                            </Submit>
                          </ActionForm>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <Empty>No orders match.</Empty>
        )}
        <Pagination base="/admin/orders" params={params} page={page} total={result.total} pageSize={PAGE_SIZE} />
      </Card>
    </>
  );
}
