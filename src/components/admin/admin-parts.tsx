import type { Order } from "@/lib/admin-data";
import { Badge, money } from "./admin-ui";

/** Shown in place of a page whose data couldn't load, with the likely fix. */
export function LoadError({ error }: { error: unknown }) {
  console.error("admin: loading data failed", error);
  const message = error instanceof Error ? error.message : String(error);
  const missingSchema = /does not exist/i.test(message);

  return (
    <div role="alert" className="rounded-2xl border border-[#ff6b5a]/30 bg-[#ff6b5a]/[0.06] p-6">
      <p className="text-[16px] font-bold text-white">Couldn&apos;t load this page&apos;s data</p>
      <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-white/70">
        {missingSchema
          ? "The database is missing tables or columns the admin panel needs. Run the SQL files in supabase/migrations that haven't been applied yet (in the Supabase SQL editor), then reload."
          : "The database didn't respond. Check DATABASE_URL and try again in a moment."}
      </p>
      <p className="mt-3 font-mono text-[12.5px] text-white/45">{message}</p>
    </div>
  );
}

/** An order's amount, or what happened to it. */
export function OrderStatus({ order }: { order: Pick<Order, "source" | "refundedAt" | "amountCents" | "currency"> }) {
  if (order.source === "grant") return <Badge>Given</Badge>;
  return (
    <span className="inline-flex items-center justify-end gap-2">
      {order.refundedAt ? <Badge tone="bad">Refunded</Badge> : null}
      <span className={order.refundedAt ? "text-white/40 line-through" : "font-semibold text-white"}>
        {money(order.amountCents, order.currency)}
      </span>
    </span>
  );
}
