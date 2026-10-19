"use client";

import Link from "next/link";
import { useState } from "react";
import { Arrow, Container, Section, type Tone } from "./ui";
import { BookCover } from "./book-cover";
import { CheckoutModal, type CheckoutItem } from "./checkout-modal";
import { BOOK_CATEGORIES, BOOKS, type Book } from "@/lib/books";

/** Pass `owned` (book ids from getLibrary) on member pages to mark books already bought. */
export function BookShelf({ tone, owned = [] }: { tone: Tone; owned?: string[] }) {
  const [active, setActive] = useState("All");
  const [buying, setBuying] = useState<CheckoutItem | null>(null);
  const shown =
    active === "All" ? BOOKS : BOOKS.filter((b) => b.category === active);

  const buy = (b: Book) =>
    setBuying({
      ref: { type: "book", id: b.id },
      kind: "Trading book",
      title: b.title,
      detail: `${b.format} · ${b.pages} pages`,
      price: b.price,
      visual: <BookCover book={b} />,
    });

  return (
    <Section id="all-books" tone={tone} className="py-20 lg:py-24">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold leading-[1.05] text-fg">
              The bookshelf
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              {shown.length} {shown.length === 1 ? "book" : "books"}
              {active === "All" ? "" : ` in ${active}`}
            </p>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {BOOK_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={active === c}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-all duration-200 ${
                  active === c
                    ? "border-transparent bg-chip text-on-chip"
                    : "border-edge bg-card text-muted hover:border-fg/30 hover:text-fg"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((b) => (
            <article key={b.id} className="group flex flex-col">
              <BookCover book={b} />

              <div className="mt-6 flex flex-1 flex-col">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-ink">
                  {b.category}
                </p>
                <h3 className="mt-1 text-[15.5px] font-bold leading-snug text-fg">
                  {b.title}
                </h3>
                <p className="mt-1 text-[12.5px] text-muted">
                  {b.format} &middot; {b.pages} pages
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                  {owned.includes(b.id) ? (
                    <>
                      <p className="font-display text-[18px] font-extrabold text-fg">Owned</p>
                      <Link
                        href="/account/books"
                        className="inline-flex items-center gap-1 rounded-full bg-chip px-3.5 py-2 text-[12.5px] font-semibold text-on-chip transition-opacity hover:opacity-85"
                      >
                        Download <Arrow />
                      </Link>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => buy(b)}
                        aria-label={`Buy ${b.title} for ${b.price}`}
                        className="font-display text-[18px] font-extrabold tabnum text-fg underline-offset-4 transition-colors hover:text-accent-ink hover:underline"
                      >
                        {b.price}
                      </button>
                      <button
                        type="button"
                        onClick={() => buy(b)}
                        className="inline-flex items-center gap-1 rounded-full bg-chip px-3.5 py-2 text-[12.5px] font-semibold text-on-chip transition-opacity hover:opacity-85"
                      >
                        Get book <Arrow />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>

      <CheckoutModal item={buying} onClose={() => setBuying(null)} />
    </Section>
  );
}
