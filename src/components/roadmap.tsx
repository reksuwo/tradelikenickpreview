import Image from "next/image";
import { Container, Section, SectionHeading, type Tone } from "./ui";
import { clockTime, LECTURES } from "@/lib/lectures";

/** One accent per step, in watch order. */
const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];

export function Roadmap({ tone }: { tone: Tone }) {
  return (
    <Section id="roadmap" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="The Roadmap"
          blurb="Five lectures, in order. Find the trade, build it, execute it, track it, then review what happened and run the process again."
        />

        <ol className="mt-14 flex flex-wrap justify-center gap-4">
          {LECTURES.map((l, i) => {
            const color = COLORS[i % COLORS.length];
            const n = String(l.n).padStart(2, "0");
            return (
              <li
                key={l.n}
                className="group relative flex w-full flex-col overflow-hidden rounded-[22px] border p-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-card sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)]"
                style={{
                  backgroundImage: `linear-gradient(150deg, ${color}2e, ${color}0d 70%)`,
                  borderColor: `${color}40`,
                }}
              >
                <div className="relative aspect-video overflow-hidden rounded-[14px] border border-black/5 bg-art-dark">
                  <Image
                    src={l.thumbnail}
                    alt={`Lecture ${l.n}: ${l.title}`}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {i === 0 ? (
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-accent px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-on-accent shadow-sm">
                      Start here
                    </span>
                  ) : null}
                  <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-bold tabnum text-white">
                    {clockTime(l.seconds)}
                  </span>
                </div>

                <div className="relative flex flex-1 flex-col px-3 pb-3 pt-5">
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-5 right-0 font-display text-[96px] font-extrabold leading-none tabnum"
                    style={{ color, opacity: 0.14 }}
                  >
                    {n}
                  </span>

                  <div className="relative flex items-center gap-3">
                    <span
                      className="grid size-10 shrink-0 place-items-center rounded-xl font-display text-[15px] font-extrabold tabnum text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      {n}
                    </span>
                    <p
                      className="text-[12px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color }}
                    >
                      Step {i + 1} of {LECTURES.length}
                    </p>
                  </div>

                  <h3 className="relative mt-4 text-[18px] font-extrabold leading-snug text-fg">
                    {l.title}
                  </h3>
                  <p className="relative mt-1.5 max-w-[34ch] text-[14px] leading-relaxed text-muted">
                    {l.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </Section>
  );
}
