import Link from "next/link";
import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { Container, Section } from "./ui";
import { LEGAL_UPDATED } from "@/lib/legal";

export type LegalSection = { id: string; title: string; body: ReactNode };

/** Layout for the Terms of Service and Privacy Policy: contents list plus numbered sections. */
export function LegalPage({
  title,
  intro,
  sections,
  related,
}: {
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  /** The other legal document, linked at the foot of the contents. */
  related: { label: string; href: string };
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section tone="light" className="relative overflow-hidden">
          <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-60" />
          <Container className="relative py-16 lg:py-20">
            <p className="text-[12.5px] font-bold uppercase tracking-[0.14em] text-accent-ink">Legal</p>
            <h1 className="mt-3 max-w-3xl text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-[1.04] text-fg">
              {title}
            </h1>
            <p className="mt-4 text-[14px] text-faint">Last updated {LEGAL_UPDATED}</p>
            <div className="mt-6 max-w-2xl text-[16.5px] leading-relaxed text-muted">{intro}</div>
          </Container>
        </Section>

        <Section tone="light" className="py-14 lg:py-20">
          <Container className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
            <nav aria-label="Contents" className="lg:sticky lg:top-32 lg:self-start">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-fg">Contents</p>
              <ol className="mt-4 space-y-2 border-l border-edge pl-4 text-[14px]">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted transition-colors hover:text-accent-ink">
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
              <Link
                href={related.href}
                className="mt-6 inline-block text-[14px] font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4"
              >
                {related.label}
              </Link>
            </nav>

            <div className="max-w-3xl space-y-12">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="scroll-mt-32">
                  <h2 className="text-[22px] font-extrabold leading-snug text-fg">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="mt-4 space-y-4 text-[15.5px] leading-relaxed text-muted [&_a]:font-semibold [&_a]:text-fg [&_a]:underline [&_a]:decoration-accent [&_a]:decoration-2 [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-fg [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter tone="light" />
    </>
  );
}
