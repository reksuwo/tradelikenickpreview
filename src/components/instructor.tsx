import { Check, Container, Eyebrow, Section, type Tone } from "./ui";

const CREDS = [
  "Nine years trading index futures full time",
  "Former risk analyst at a Chicago prop desk",
  "Taught 4,800+ students since 2019",
  "Publishes his own monthly stat pack, wins and losses",
];

export function Instructor({ tone }: { tone: Tone }) {
  return (
    <Section id="instructor" tone={tone} className="py-20 lg:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="relative">
            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[32px] bg-accent/20 blur-2xl" />
            <div className="overflow-hidden rounded-[26px] border border-edge bg-sunken shadow-card">
              <div className="relative flex aspect-4/5 items-end justify-center">
                <svg
                  viewBox="0 0 200 250"
                  aria-label="Portrait placeholder of the instructor"
                  role="img"
                  className="size-full"
                >
                  <rect width="200" height="250" fill="var(--s-sunken)" />
                  <circle cx="100" cy="96" r="42" fill="var(--s-line)" />
                  <path d="M22 250c0-44 35-74 78-74s78 30 78 74z" fill="var(--s-line)" />
                  <path
                    d="M8 226 L40 214 L72 222 L104 196 L136 204 L168 172 L192 160"
                    fill="none"
                    stroke="var(--s-accent)"
                    strokeWidth="3"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-edge bg-card px-4 py-3 backdrop-blur">
                  <div>
                    <p className="text-[15px] font-bold text-fg">Nick Alvarez</p>
                    <p className="text-[12.5px] text-muted">Founder, TradeLikeNick</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-on-accent">
                    Est. 2019
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Eyebrow>Your instructor</Eyebrow>
            <h2 className="mt-5 text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] text-fg">
              I blew up two accounts before anyone taught me risk.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
              The first four years of my trading were a loop: find a strategy, size up after two
              good weeks, give it all back in a day. Nothing changed until I stopped hunting setups
              and started running my account like a desk would — fixed risk, a written plan, a
              review every Friday.
            </p>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">
              These courses are the version of that process I wish someone had handed me in year
              one. No signals, no screenshots of a Lamborghini, no promises about your income.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {CREDS.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-3 rounded-2xl border border-edge bg-card px-4 py-3.5 text-[14.5px] leading-snug text-muted"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent-ink">
                    <Check className="size-3" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            <blockquote className="mt-8 border-l-[3px] border-accent pl-5 font-display text-[19px] font-bold leading-snug text-fg">
              &ldquo;Consistency is boring. That is the whole secret, and it is why most people
              never get there.&rdquo;
            </blockquote>
          </div>
        </div>
      </Container>
    </Section>
  );
}
