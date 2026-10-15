import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BookShelf } from "@/components/book-shelf";
import { BookCover } from "@/components/book-cover";
import { FinalCta } from "@/components/final-cta";
import { Arrow, Container, CTA, Highlight, Section } from "@/components/ui";
import { BOOKS } from "@/lib/books";

export const metadata: Metadata = {
  title: "Trading Books — TradeLikeNick",
  description:
    "Trading books and workbooks by Nick Pham: options, probability, risk management, SPX and disciplined strategies.",
};

const FEATURED = BOOKS.slice(0, 3);

export default function BooksPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section tone="light" className="relative overflow-hidden">
          <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
          />
          <Container className="relative grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div className="text-center lg:text-left">
              <h1 className="text-[clamp(2.4rem,5.4vw,3.9rem)] font-extrabold leading-[1.02] text-fg">
                Trading books for <Highlight>disciplined</Highlight> traders
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted lg:mx-0">
                Nick&rsquo;s frameworks, playbooks and workbooks in a format you can read, print
                and keep on your desk. Every book pairs with the courses, so you can study the
                theory and then watch it traded.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <CTA href="#all-books" size="lg">
                  Browse the books <Arrow />
                </CTA>
                <CTA href="/courses" variant="outline" size="lg">
                  View courses
                </CTA>
              </div>
            </div>

            {/* Fanned stack of featured covers */}
            <div className="relative mx-auto h-[340px] w-full max-w-[460px] sm:h-[400px]">
              {FEATURED.map((b, i) => (
                <div
                  key={b.id}
                  className="absolute top-1/2 w-[46%]"
                  style={{
                    left: `${4 + i * 25}%`,
                    transform: `translateY(-50%) rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -14 : 8}px)`,
                    zIndex: i === 1 ? 3 : 2 - Math.abs(i - 1),
                  }}
                >
                  <BookCover book={b} />
                </div>
              ))}
            </div>
          </Container>
        </Section>

        <BookShelf tone="dark" />
        <FinalCta tone="light" />
      </main>
      <SiteFooter tone="dark" />
    </>
  );
}
