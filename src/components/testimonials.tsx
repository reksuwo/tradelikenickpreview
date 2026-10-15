import { Arrow, Container, CTA, Section, SectionHeading, Star, type Tone } from "./ui";
import { CASES, SHORTS } from "@/lib/testimonials";

export function Quote() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-7 text-accent">
      <path
        d="M9.5 5.5C6 7 4 9.8 4 13.4V18h6v-6H7.2c.2-1.9 1.2-3.4 3-4.4l-.7-2.1zm10 0C16 7 14 9.8 14 13.4V18h6v-6h-2.8c.2-1.9 1.2-3.4 3-4.4l-.7-2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Stars() {
  return (
    <div className="flex gap-0.5 text-accent-ink" aria-label="Rated 5 out of 5">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className="size-3.5" />
      ))}
    </div>
  );
}

export function Testimonials({ tone }: { tone: Tone }) {
  return (
    <Section id="results" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Traders who learned to think in probabilities"
          blurb="No income screenshots here. These are the habits and results students say changed after learning options the disciplined way."
        />

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

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SHORTS.map((s) => (
            <div key={s.name} className="flex flex-col rounded-[22px] border border-edge bg-card p-5">
              <Stars />
              <p className="mt-3 flex-1 text-[14.5px] leading-relaxed text-muted">&ldquo;{s.quote}&rdquo;</p>
              <p className="mt-4 text-[13px] font-semibold text-fg">{s.name}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <CTA href="/testimonials" variant="outline">
            Read all testimonials <Arrow />
          </CTA>
        </div>

        <p className="mt-8 text-center text-[12.5px] text-faint">
          Testimonials describe individual experiences and are not a guarantee of any outcome.
          Options trading involves risk and is not suitable for all investors.
        </p>
      </Container>
    </Section>
  );
}
