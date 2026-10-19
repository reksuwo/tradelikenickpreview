import type { Metadata } from "next";
import { iconFor } from "@/components/account/account-links";
import { EmptyState, PageHeading } from "@/components/account/account-ui";
import { BookCover } from "@/components/book-cover";
import { BOOKS } from "@/lib/books";
import { getLibrary } from "@/lib/purchases";

export const metadata: Metadata = { title: "My Books — TradeLikeNick" };

export default async function MyBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const library = await getLibrary();
  const books = BOOKS.filter((b) => library.books.includes(b.id));
  const { missing } = await searchParams;
  const missingBook = BOOKS.find((b) => b.id === missing);

  return (
    <>
      <PageHeading title="My Books" intro="Ebooks and PDFs you've bought, ready to read or download." />

      {missingBook ? (
        <div role="alert" className="mb-6 rounded-2xl border border-white/15 bg-white/[0.04] p-5 text-[14.5px] leading-relaxed text-white/75">
          <span className="font-bold text-white">{missingBook.title}</span> isn&apos;t ready to download yet. Try again
          later, or contact support from the Help page if you need it now.
        </div>
      ) : null}

      {books.length ? (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
          {books.map((b) => (
            <li key={b.id} className="flex flex-col">
              <BookCover book={b} />
              <p className="mt-5 text-[15px] font-bold leading-snug text-white">{b.title}</p>
              <p className="mt-1 text-[12.5px] text-white/50">
                {b.format} · {b.pages} pages
              </p>
              {/* A plain link: the route answers with a redirect to the file, not a page. */}
              <a
                href={`/api/books/${b.id}/download`}
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-[13.5px] font-bold text-ink transition-colors hover:bg-white/85"
              >
                <svg viewBox="0 0 24 24" aria-hidden className="size-4">
                  <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 19.5h14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download PDF
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={iconFor("/account/books")}
          title="No books yet"
          body="Books you buy show up here, with download links for every format."
          cta={{ label: "Browse trading books", href: "/browse/books" }}
        />
      )}
    </>
  );
}
