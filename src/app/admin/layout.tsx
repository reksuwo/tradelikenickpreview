import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrowseHeader } from "@/components/browse/browse-header";
import { requireAdmin } from "@/lib/admin";
import { toMember } from "@/lib/member";
import { getNotifications } from "@/lib/notifications";

export const metadata: Metadata = {
  title: { template: "%s — Admin — TradeLikeNick", default: "Admin — TradeLikeNick" },
  robots: { index: false, follow: false },
};

/** Only admins get past requireAdmin; everyone else sees a 404. Each page and action checks again. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const notifications = await getNotifications();

  return (
    <div className="theme-dark min-h-screen bg-[#0b0d0c] pb-24 text-white">
      <BrowseHeader member={toMember(user)} notifications={notifications} />
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 pt-6 sm:px-8 lg:grid-cols-[200px_1fr] lg:gap-12 lg:pt-12">
        <AdminNav />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
