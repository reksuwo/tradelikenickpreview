import { Container, Section, SectionHeading, type Tone } from "./ui";

const FOR = [
  {
    tag: "Starting out",
    title: "You are brand new",
    body: "You have opened an account and closed it twice. Start at episode one and follow the order — the drills keep you off live markets until the process holds.",
  },
  {
    tag: "Reset",
    title: "You have blown up an account",
    body: "Usually a sizing problem wearing a strategy costume. Start with the Position Sizing Masterclass — nothing says you have to watch in order.",
  },
  {
    tag: "Evaluations",
    title: "You are chasing a prop payout",
    body: "Daily loss limits and drawdown rules are exactly what the risk model is built around. The Prop Firm Playbook maps the plan onto an evaluation.",
  },
  {
    tag: "Part-time",
    title: "You trade around a job",
    body: "The setups live in the first ninety minutes of the US session. If that is all the screen time you have, the plan is built for it.",
  },
];

export function Audience({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Four traders walk in. Same process, different starting point."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FOR.map((f, i) => (
            <article
              key={f.title}
              className="group relative flex flex-col overflow-hidden rounded-[22px] border border-edge bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-card"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-8 font-display text-[92px] font-extrabold leading-none text-sunken transition-colors group-hover:text-accent/25"
              >
                {i + 1}
              </span>
              <span className="relative w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-[0.1em] text-accent-ink">
                {f.tag}
              </span>
              <h3 className="relative mt-5 text-[18px] font-bold leading-snug text-fg">
                {f.title}
              </h3>
              <p className="relative mt-3 text-[14.5px] leading-relaxed text-muted">{f.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 rounded-[22px] border border-dashed border-edge bg-sunken p-6 sm:flex-row sm:items-center sm:gap-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-card text-fg">
            <svg viewBox="0 0 24 24" aria-hidden className="size-5">
              <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.9" />
              <path
                d="M12 7.5v6M12 16.2v.3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <p className="text-[15px] leading-relaxed text-muted">
            <span className="font-bold text-fg">Not for you if</span> you want alerts to copy, a
            strategy that never loses, or a shortcut to quitting your job in ninety days. Those
            exist elsewhere and they cost more than this library does.
          </p>
        </div>
      </Container>
    </Section>
  );
}
