import { AccountSidebar } from "@/components/account/account-sidebar";
import { BrowseHeader } from "@/components/browse/browse-header";
import { requireMember } from "@/lib/member";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember("/account");

  return (
    <div className="theme-dark min-h-screen bg-[#0b0d0c] pb-24 text-white">
      <BrowseHeader member={member} />
      <div className="mx-auto grid max-w-[1200px] gap-8 px-4 pt-6 sm:px-8 lg:grid-cols-[230px_1fr] lg:gap-14 lg:pt-12">
        <AccountSidebar />
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
