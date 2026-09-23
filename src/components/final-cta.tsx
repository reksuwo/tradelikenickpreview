import { Arrow, Container, CTA, Highlight, Section, type Tone } from "./ui";

export function FinalCta({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-56 left-1/2 size-[760px] -translate-x-1/2 rounded-full bg-accent/25 blur-[150px]"
      />
      <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-60" />

      <Container className="relative py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[12px] font-extrabold uppercase tracking-[0.2em] text-accent-ink">
            New this week &mdash; Trading Live With Nick
          </p>
          <h2 className="mt-5 text-[clamp(2.2rem,5.2vw,3.7rem)] font-extrabold leading-[1.02] text-fg">
            The market does not care how motivated you are. It cares whether you have{" "}
            <Highlight>a plan</Highlight>.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted">
            Join 4,800 members who stopped improvising. Make an account, press play on episode one,
            and have your first written plan by the weekend.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CTA href="/signin" size="lg">
              Sign in and start watching <Arrow />
            </CTA>
            <CTA href="#library" variant="outline" size="lg">
              Browse the library
            </CTA>
          </div>
          <p className="mt-7 text-[13px] font-medium text-muted">
            Free account &middot; First two episodes of every course free &middot; 30-day refund
          </p>
        </div>
      </Container>
    </Section>
  );
}
