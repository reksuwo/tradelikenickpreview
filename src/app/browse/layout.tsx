import { BrowseHeader } from "@/components/browse/browse-header";
import { requireMember } from "@/lib/member";

export default async function BrowseLayout({ children }: { children: React.ReactNode }) {
  const member = await requireMember("/browse");

  return (
    <div className="theme-dark min-h-screen bg-[#0b0d0c] pb-24 text-white">
      <BrowseHeader member={member} />
      <main>{children}</main>
    </div>
  );
}
