import type { Metadata } from "next";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading } from "@/components/account/account-ui";

export const metadata: Metadata = { title: "My Books — TradeLikeNick" };

export default function MyBooksPage() {
  return (
    <>
      <PageHeading title="My Books" intro="Ebooks and PDFs you've bought, ready to read or download." />
      <EmptyState
        icon={iconFor("/account/books")}
        title="No books yet"
        body="Books you buy show up here, with download links for every format."
        cta={{ label: "Browse trading books", href: "/browse/books" }}
      />
    </>
  );
}
