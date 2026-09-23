import { Container, Section, SectionHeading, type Tone } from "./ui";

const CASES = [
  {
    metric: "14 months",
    metricLabel: "To a consistent plan",
    quote:
      "I had six strategies and no rules. The planning episode forced me to write one page and trade only that. My losing days are still there, they are just a third of the size.",
    name: "Priya R.",
    role: "Swing trader, Manchester",
    initials: "PR",
  },
  {
    metric: "0.5%",
    metricLabel: "Risk cap, held for a year",
    quote:
      "The sizing course was uncomfortable because it made my wins smaller. It also meant my first bad week did not end my account. That trade-off was the whole lesson.",
    name: "Marcus T.",
    role: "Futures, Atlanta",
    initials: "MT",
  },
  {
    metric: "312",
    metricLabel: "Trades journaled",
    quote:
      "The review process found something I never would have: I lose money every Friday afternoon. I stopped trading that window and my month changed shape.",
    name: "Dana K.",
    role: "Part-time trader, Toronto",
    initials: "DK",
  },
];

const SHORTS = [
  {
    quote: "First course I have finished. The drills at the end of each lesson are the reason why.",
    name: "Owen B.",
  },
  {
    quote: "Nick posts his losers in the live calls. That alone bought my trust.",
    name: "Sofia L.",
  },
  {
    quote: "I came for setups and left with a risk process. Honestly the better trade.",
    name: "Hassan M.",
  },
  {
    quote: "The Discord is the only trading room I have been in with zero signal spam.",
    name: "Grace W.",
  },
];

function Quote() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-7 text-accent">
      <path
        d="M9.5 5.5C6 7 4 9.8 4 13.4V18h6v-6H7.2c.2-1.9 1.2-3.4 3-4.4l-.7-2.1zm10 0C16 7 14 9.8 14 13.4V18h6v-6h-2.8c.2-1.9 1.2-3.4 3-4.4l-.7-2.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Testimonials({ tone }: { tone: Tone }) {
  return (
    <Section id="results" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Member stories"
          title="What changes is the process, not the promise"
          blurb="No income screenshots here. These are the habits students say actually shifted after working through the library."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {CASES.map((c) => (
            <article
              key={c.name}
              className="flex flex-col rounded-[22px] border border-edge bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-card sm:p-7"
            >
              <Quote />
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
            <div key={s.name} className="rounded-[22px] border border-edge bg-card p-5">
              <p className="text-[14.5px] leading-relaxed text-muted">&ldquo;{s.quote}&rdquo;</p>
              <p className="mt-4 text-[13px] font-semibold text-fg">{s.name}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[12.5px] text-faint">
          Testimonials describe individual experiences and are not a guarantee of any outcome.
          Trading involves risk of loss.
        </p>
      </Container>
    </Section>
  );
}
