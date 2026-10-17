import Image from "next/image";
import { Arrow, Container, CTA, PlayIcon, Section, type Tone } from "./ui";
import { ChartBackdrop } from "./chart-backdrop";
import { clockTime, LECTURES } from "@/lib/lectures";

const EPISODES = LECTURES;

const COUNT_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const countWord = (n: number) => COUNT_WORDS[n] ?? String(n);

export function Curriculum({
  tone,
  limit,
}: {
  tone: Tone;
  /** Show only the first N episodes, plus a link to /courses. */
  limit?: number;
}) {
  const episodes = limit ? EPISODES.slice(0, limit) : EPISODES;

  return (
    <Section id="courses" tone={tone} className="relative overflow-hidden py-20 lg:py-28">
      <ChartBackdrop />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-[clamp(2rem,4.2vw,3rem)] font-extrabold leading-[1.04] text-fg">
              Inside the flagship series
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
              <span className="font-semibold text-fg">The Complete Trading System</span> is{" "}
              {countWord(EPISODES.length)} lectures of core footage plus 138 supporting lessons. The
              first two are free to watch before you decide anything.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { k: "Lectures", v: String(EPISODES.length) },
                { k: "Lessons", v: "148" },
                { k: "Runtime", v: "62 hrs" },
                { k: "Drills", v: "32" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-edge bg-card px-4 py-3.5 backdrop-blur-xl">
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

          <div className="divide-y divide-edge overflow-hidden rounded-[24px] border border-edge bg-card backdrop-blur-xl">
            {episodes.map((e) => (
              <article
                key={e.n}
                className="group flex items-start gap-4 p-4 transition-colors hover:bg-sunken sm:gap-5 sm:p-5"
              >
                <span className="w-5 shrink-0 pt-6 text-center font-display text-[15px] font-extrabold tabnum text-faint sm:pt-7">
                  {e.n}
                </span>

                <div className="relative aspect-video w-[120px] shrink-0 overflow-hidden rounded-lg border border-edge bg-art-dark sm:w-[160px]">
                  <Image
                    src={e.thumbnail}
                    alt={`Lecture ${e.n}: ${e.title}`}
                    fill
                    sizes="(min-width: 640px) 160px, 120px"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">
                      <PlayIcon className="size-3.5 translate-x-px" />
                    </span>
                  </span>
                  <span className="absolute bottom-1.5 right-1.5 rounded bg-black/85 px-1 py-0.5 text-[9.5px] font-bold tabnum text-white">
                    {clockTime(e.seconds)}
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

            {limit && EPISODES.length > limit ? (
              <div className="flex flex-col items-start justify-between gap-4 bg-sunken p-5 sm:flex-row sm:items-center">
                <p className="text-[14px] font-semibold text-muted">
                  +{EPISODES.length - limit} more{" "}
                  {EPISODES.length - limit === 1 ? "lecture" : "lectures"} in this course
                </p>
                <CTA href="/courses">
                  View all courses <Arrow />
                </CTA>
              </div>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
