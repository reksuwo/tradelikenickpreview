import { Container, Section, SectionHeading, type Tone } from "./ui";

const STEPS = [
  { n: "00", color: "#10b981", title: "Getting Started" },
  { n: "01", color: "#3b82f6", title: "Nick's 3M Framework" },
  { n: "02", color: "#8b5cf6", title: "Nick's 5-Step Trading Blueprint" },
  { n: "03", color: "#ec4899", title: "SPX: The Market, The Game, The Vehicle" },
  { n: "04", color: "#f97316", title: "The Strategy Playbook" },
  { n: "05", color: "#ca8a04", title: "The SPX Gameplan" },
  { n: "06", color: "#0891b2", title: "Nick's SPX Trading Business" },
];

export function Roadmap({ tone }: { tone: Tone }) {
  return (
    <Section id="roadmap" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="The Roadmap"
          blurb="Seven stages, in order. Start at zero and build step by step toward running SPX trading like a business."
        />

        <ol className="mt-14 flex flex-wrap justify-center gap-4">
          {STEPS.map((s, i) => {
            const first = i === 0;
            return (
              <li
                key={s.n}
                className="group relative flex w-full flex-col overflow-hidden rounded-[22px] border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-card sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]"
                style={{
                  backgroundImage: `linear-gradient(150deg, ${s.color}2e, ${s.color}0d 70%)`,
                  borderColor: `${s.color}40`,
                }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 -top-4 font-display text-[110px] font-extrabold leading-none tabnum"
                  style={{ color: s.color, opacity: 0.16 }}
                >
                  {s.n}
                </span>

                <div className="relative flex items-center justify-between">
                  <span
                    className="grid size-12 place-items-center rounded-2xl font-display text-[18px] font-extrabold tabnum text-white shadow-sm"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.n}
                  </span>
                  {first ? (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-on-accent">
                      Start here
                    </span>
                  ) : null}
                </div>

                <p
                  className="relative mt-8 text-[12px] font-semibold uppercase tracking-[0.14em]"
                  style={{ color: s.color }}
                >
                  Step {i + 1} of {STEPS.length}
                </p>
                <h3
                  className="relative mt-1.5 text-[18px] font-extrabold leading-snug text-fg"
                >
                  {s.title}
                </h3>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
