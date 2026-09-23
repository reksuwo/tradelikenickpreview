import { Arrow, Check, Container, CTA, Section, SectionHeading, type Tone } from "./ui";

const STEPS = [
  {
    n: "01",
    title: "Create a free account",
    body: "Takes about twenty seconds. No card, no sales call. Your account is the library — everything you buy lives in it permanently.",
  },
  {
    n: "02",
    title: "Watch the opening episodes free",
    body: "The first two episodes of every course are unlocked. Watch Nick teach before you decide whether the way he explains things works for you.",
  },
  {
    n: "03",
    title: "Buy the courses you want",
    body: "Pick up a single title or the whole shelf, right from inside your account. No bundles forced on you and no subscription to cancel later.",
  },
];

const PROMISES = [
  "30-day refund window on anything you buy",
  "Courses stay in your library for good",
  "New lessons added to what you own, free",
  "Education only — no signals, no performance claims",
];

export function Access({ tone }: { tone: Tone }) {
  // The closing panel runs the opposite theme so it reads as a deliberate
  // inset block rather than another card.
  const panelTheme = tone === "light" ? "theme-dark" : "theme-light";

  return (
    <Section id="access" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="Getting started"
          title="Sign in first. Buy what you want after."
          blurb="There is no paywall on the front door. Make an account, look around the library, and only buy the courses you actually want to watch."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {STEPS.map((s) => (
            <article
              key={s.n}
              className="group relative overflow-hidden rounded-[24px] border border-edge bg-card p-7 transition-all duration-200 hover:-translate-y-1.5 hover:border-accent hover:shadow-card"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-5 -top-7 font-display text-[92px] font-extrabold leading-none text-sunken transition-colors duration-200 group-hover:text-accent/25"
              >
                {s.n}
              </span>
              <h3 className="relative text-[19px] font-bold text-fg">{s.title}</h3>
              <p className="relative mt-3 text-[15px] leading-relaxed text-muted">{s.body}</p>
            </article>
          ))}
        </div>

        <div
          className={`${panelTheme} mt-8 grid items-center gap-8 rounded-[26px] border border-edge bg-surface p-7 shadow-float sm:p-9 lg:grid-cols-[1.1fr_0.9fr]`}
        >
          <div>
            <h3 className="text-[clamp(1.5rem,2.6vw,2rem)] font-extrabold leading-tight text-fg">
              Make an account and start watching tonight
            </h3>
            <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-muted">
              Free to join, free to browse, and the opening episodes are on the house. Everything
              else is a one-time purchase you keep.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <CTA href="/signin" size="lg">
                Sign in <Arrow />
              </CTA>
              <CTA href="#library" variant="outline" size="lg">
                Browse the library first
              </CTA>
            </div>
          </div>

          <ul className="space-y-3.5">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[14.5px] leading-snug text-muted">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
                  <Check className="size-3" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
