import type { Metadata } from "next";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading } from "@/components/account/account-ui";

export const metadata: Metadata = { title: "Wishlist — TradeLikeNick" };

export default function WishlistPage() {
  return (
    <>
      <PageHeading title="Wishlist" intro="Courses and books you've saved for later." />
      <EmptyState
        icon={iconFor("/account/wishlist")}
        title="Your wishlist is empty"
        body="Save a course or book while you browse and it will wait for you here."
        cta={{ label: "Explore courses", href: "/browse/courses" }}
      />
    </>
  );
}
