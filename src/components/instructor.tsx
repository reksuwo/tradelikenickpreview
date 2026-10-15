import Image from "next/image";
import { Check, Container, Section, type Tone } from "./ui";

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
                <Image
                  src="/nick-pham.png"
                  alt="Nick Pham, founder of TradeLikeNick"
                  fill
                  sizes="(min-width: 1024px) 460px, 100vw"
                  className="object-cover object-top"
                />
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-edge bg-card px-4 py-3 backdrop-blur">
                  <div>
                    <p className="text-[15px] font-bold text-fg">Nick Pham</p>
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
            <h2 className="text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.05] text-fg">
              Learn Options Trading. Understand Probability. Trade With Confidence.
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
              I&rsquo;m Nick Pham, a former Trading Coach at Investools (TD Ameritrade) and
              Optionetics (Charles Schwab). I combine trading, teaching, and math to help you learn
              options trading with a focus on probability, risk management, and disciplined
              strategies.
            </p>
            <p className="mt-4 text-[16.5px] leading-relaxed text-muted">
              From first-time options traders building a solid foundation to experienced traders
              refining their edge, every lesson is built to be practical and grounded in
              probability. The goal is simple: trade with clarity, discipline, and purpose, free
              from hype and unrealistic promises.
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
