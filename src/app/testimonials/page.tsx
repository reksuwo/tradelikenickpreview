import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FinalCta } from "@/components/final-cta";
import { Quote, Stars } from "@/components/testimonials";
import { Arrow, Container, CTA, Highlight, Section } from "@/components/ui";
import { CASES, SHORTS, WALL } from "@/lib/testimonials";

export const metadata: Metadata = {
  title: "Testimonials — TradeLikeNick",
  description:
    "What students say about learning options trading with Nick Pham: probability, risk management, and disciplined strategies.",
};

// Placeholder summary figures — update with real numbers before launch.
const SUMMARY = [
  { value: "4.9/5", label: "Average course rating" },
  { value: "4,800+", label: "Students taught" },
  { value: "All levels", label: "Beginner to advanced" },
];

const MORE = [...WALL, ...SHORTS];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .replace(/[^A-Z]/gi, "")
    .slice(0, 2)
    .toUpperCase();
}

export default function TestimonialsPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <Section tone="light" className="relative overflow-hidden">
          <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
          />
          <Container className="relative py-20 text-center lg:py-28">
            <h1 className="mx-auto max-w-4xl text-[clamp(2.4rem,5.6vw,4rem)] font-extrabold leading-[1.02] text-fg">
              Real traders. Real progress. <Highlight>No hype.</Highlight>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">
              Hear from students who learned to trade options with a focus on probability, risk
              management, and disciplined strategies &mdash; from first-time traders to
              experienced investors refining their edge.
            </p>

            <dl className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
              {SUMMARY.map((s) => (
                <div key={s.label} className="rounded-2xl border border-edge bg-card px-5 py-5 shadow-card">
                  <dt className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-1.5 font-display text-[30px] font-extrabold leading-none tabnum text-fg">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        {/* Featured stories */}
        <Section tone="dark" className="py-20 lg:py-24">
          <Container>
            <div className="flex flex-col items-center gap-5 text-center">
              <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] text-fg">
                How students changed the way they trade
              </h2>
            </div>

            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {CASES.map((c) => (
                <article
                  key={c.name}
                  className="flex flex-col rounded-[22px] border border-edge bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-card sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <Quote />
                    <Stars />
                  </div>
                  <p className="mt-5 font-display text-[clamp(2rem,3.4vw,2.5rem)] font-extrabold leading-none tabnum text-fg">
                    {c.metric}
                  </p>
                  <p className="mt-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] text-accent-ink">
                    {c.metricLabel}
                  </p>
                  <p className="mt-5 flex-1 text-[15.5px] leading-relaxed text-muted">
                    &ldquo;{c.quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3 border-t border-edge pt-5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-chip text-[12.5px] font-bold text-on-chip">
                      {c.initials}
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-fg">{c.name}</p>
                      <p className="text-[12.5px] text-muted">{c.role}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </Section>

        {/* Wall of quotes */}
        <Section tone="light" className="py-20 lg:py-24">
          <Container>
            <div className="flex flex-col items-center gap-5 text-center">
              <h2 className="max-w-3xl text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] text-fg">
                In their own words
              </h2>
            </div>

            <div className="mt-14 gap-5 sm:columns-2 lg:columns-3">
              {MORE.map((t) => (
                <figure
                  key={t.name}
                  className="mb-5 break-inside-avoid rounded-[22px] border border-edge bg-card p-6 shadow-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Stars />
                    {t.topic ? (
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-accent-ink">
                        {t.topic}
                      </span>
                    ) : null}
                  </div>
                  <blockquote className="mt-4 text-[15px] leading-relaxed text-muted">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-chip text-[12px] font-bold text-on-chip">
                      {initials(t.name)}
                    </span>
                    <div>
                      <p className="text-[14px] font-bold text-fg">{t.name}</p>
                      {t.role ? <p className="text-[12.5px] text-muted">{t.role}</p> : null}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <CTA href="/#library" variant="outline">
                Browse the courses <Arrow />
              </CTA>
            </div>

            <p className="mt-8 text-center text-[12.5px] text-faint">
              Testimonials describe individual experiences and are not a guarantee of any outcome.
              Options trading involves risk and is not suitable for all investors.
            </p>
          </Container>
        </Section>

        <FinalCta tone="dark" />
      </main>
      <SiteFooter tone="light" />
    </>
  );
}
