import { Arrow, Container, CTA, Eyebrow, PlayIcon, Section, type Tone } from "./ui";

const EPISODES = [
  {
    n: "1",
    title: "How markets actually move",
    time: "14 min",
    desc: "Auctions, participants, and why price spends most of its life going nowhere.",
    free: true,
  },
  {
    n: "2",
    title: "Reading a chart without indicators",
    time: "22 min",
    desc: "The four marks that go on every chart before the open, and nothing else.",
    free: true,
  },
  {
    n: "3",
    title: "Setup one: the opening drive",
    time: "31 min",
    desc: "Conditions, trigger, invalidation, and 48 worked examples including the failures.",
  },
  {
    n: "4",
    title: "Setup two: the failed breakout",
    time: "28 min",
    desc: "How to spot a trap forming and time the flip without guessing the turn.",
  },
  {
    n: "5",
    title: "Setup three: value area rejection",
    time: "26 min",
    desc: "The range-day trade, when to take it, and the days to leave it alone entirely.",
  },
  {
    n: "6",
    title: "Risk, sizing and the daily stop",
    time: "34 min",
    desc: "Deciding size before emotion arrives, and the ladder that halves it in a drawdown.",
  },
  {
    n: "7",
    title: "Execution under pressure",
    time: "19 min",
    desc: "Order types, slippage, and the ten-second rule that stops the chase.",
  },
  {
    n: "8",
    title: "Writing your one-page plan",
    time: "24 min",
    desc: "The template, the rules worth keeping, and how to test one before it goes live.",
  },
  {
    n: "9",
    title: "Journaling and the Friday review",
    time: "21 min",
    desc: "Ninety seconds per trade, and the twenty minutes a week that find your leaks.",
  },
  {
    n: "10",
    title: "Going live and scaling up",
    time: "29 min",
    desc: "Sim to live, prop evaluations, and what a realistic first funded month looks like.",
  },
];

export function Curriculum({ tone }: { tone: Tone }) {
  return (
    <Section id="episodes" tone={tone} className="py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Eyebrow>Episode guide</Eyebrow>
            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.04] text-fg">
              Inside the flagship series
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
              <span className="font-semibold text-fg">The Complete Trading System</span> is ten
              episodes of core footage plus 138 supporting lessons. The first two are free to watch
              before you decide anything.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { k: "Episodes", v: "10" },
                { k: "Lessons", v: "148" },
                { k: "Runtime", v: "62 hrs" },
                { k: "Drills", v: "32" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-edge bg-card px-4 py-3.5">
                  <p className="font-display text-[22px] font-extrabold tabnum text-fg">{s.v}</p>
                  <p className="mt-0.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-faint">
                    {s.k}
                  </p>
                </div>
              ))}
            </div>

            <CTA href="/signin" size="lg" className="mt-8">
              Watch episode one free <Arrow />
            </CTA>
          </div>

          <div className="divide-y divide-edge overflow-hidden rounded-[24px] border border-edge bg-card">
            {EPISODES.map((e) => (
              <article
                key={e.n}
                className="group flex items-start gap-4 p-4 transition-colors hover:bg-sunken sm:gap-5 sm:p-5"
              >
                <span className="w-5 shrink-0 pt-6 text-center font-display text-[15px] font-extrabold tabnum text-faint sm:pt-7">
                  {e.n}
                </span>

                <div className="relative aspect-video w-[104px] shrink-0 overflow-hidden rounded-lg border border-edge bg-art-dark sm:w-[132px]">
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid size-8 place-items-center rounded-full bg-accent/20 text-accent transition-all duration-200 group-hover:bg-accent group-hover:text-on-accent">
                      <PlayIcon className="size-3.5 translate-x-px" />
                    </span>
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1 py-0.5 text-[9.5px] font-bold tabnum text-white">
                    {e.time}
                  </span>
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h3 className="text-[15.5px] font-bold leading-snug text-fg">{e.title}</h3>
                    {e.free ? (
                      <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-on-accent">
                        Free
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{e.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
