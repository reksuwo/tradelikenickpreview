import type { ReactNode } from "react";
import { Container, PlayIcon, Section, SectionHeading, type Tone } from "./ui";
import { Poster } from "./poster";
import { byId } from "@/lib/courses";

function PickVisual() {
  const ids = ["first-90", "position-sizing", "rules-over-feelings"];
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="flex gap-2.5">
        {ids.map((id, i) => (
          <div
            key={id}
            className={`relative aspect-video flex-1 overflow-hidden rounded-lg border transition-colors ${
              i === 1 ? "border-accent" : "border-edge"
            }`}
          >
            <Poster variant={byId(id).poster} label="" />
            {i === 1 ? (
              <span className="absolute inset-0 grid place-items-center bg-black/30">
                <span className="grid size-6 place-items-center rounded-full bg-accent text-on-accent">
                  <PlayIcon className="size-3" />
                </span>
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Foundations", "Risk", "Psychology", "Live"].map((c, i) => (
          <span
            key={c}
            className={`rounded-full px-2 py-1 text-[10.5px] font-bold ${
              i === 1 ? "bg-chip text-on-chip" : "bg-card text-muted"
            }`}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function DrillVisual() {
  const rows = [
    { t: "Watch: grading a setup", done: true },
    { t: "Drill: mark 10 charts", done: true },
    { t: "Quiz: 8 questions", done: false },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 p-5">
      <div className="rounded-xl border border-edge bg-card px-3.5 py-3">
        <div className="flex items-baseline justify-between">
          <p className="text-[11.5px] font-bold text-fg">Episode 3 of 10</p>
          <p className="text-[11px] font-semibold tabnum text-accent-ink">72%</p>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-sunken">
          <div className="h-full w-[72%] rounded-full bg-accent" />
        </div>
      </div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div
            key={r.t}
            className="flex items-center gap-2.5 rounded-xl border border-edge bg-card px-3.5 py-2.5"
          >
            <span
              className={`grid size-4.5 shrink-0 place-items-center rounded-full ${
                r.done ? "bg-accent text-on-accent" : "border border-edge"
              }`}
            >
              {r.done ? (
                <svg viewBox="0 0 20 20" aria-hidden className="size-2.5">
                  <path
                    d="M4 10.6l4 3.9L16 5.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : null}
            </span>
            <span className="truncate text-[12px] font-medium text-muted">{r.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3 p-5">
      <div className="relative aspect-video overflow-hidden rounded-xl border border-edge">
        <Poster variant={byId("live-archive").poster} label="" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-md bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-[0.1em] text-ink">
          <span className="size-1.5 animate-pulse-dot rounded-full bg-[#ff4d4d]" />
          Live
        </span>
        <span className="absolute bottom-2.5 right-2.5 rounded bg-black/80 px-1.5 py-0.5 text-[9.5px] font-bold tabnum text-white">
          412 watching
        </span>
      </div>
      <div className="space-y-2">
        <div className="w-fit max-w-full rounded-2xl rounded-bl-md border border-edge bg-card px-3 py-2 text-[11.5px] text-muted">
          Why did you skip the 10:15 setup?
        </div>
        <div className="ml-auto w-fit max-w-full rounded-2xl rounded-br-md bg-fg px-3 py-2 text-[11.5px] text-surface">
          Grade was a C. Pulling it up now.
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  body,
  visual,
}: {
  n: string;
  title: string;
  body: string;
  visual: ReactNode;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[24px] border border-edge bg-card transition-all duration-200 hover:-translate-y-1.5 hover:border-accent hover:shadow-card">
      <div className="h-[220px] border-b border-edge bg-sunken">{visual}</div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center rounded-lg bg-chip font-display text-[13px] font-bold tabnum text-on-chip">
            {n}
          </span>
          <h3 className="text-[18px] font-bold text-fg">{title}</h3>
        </div>
        <p className="mt-3.5 text-[15px] leading-relaxed text-muted">{body}</p>
      </div>
    </article>
  );
}

export function HowItWorks({ tone }: { tone: Tone }) {
  return (
    <Section id="how" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          title="Press play, do the reps, ask the questions"
          blurb="It is a streaming library with homework. The watching is the easy part — the drills and the weekly session are what make it stick."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Step
            n="01"
            title="Pick a course, press play"
            body="Browse by category or follow the Start Here row. Nothing is locked behind a drip schedule, so you can watch the risk course first if that is what you need."
            visual={<PickVisual />}
          />
          <Step
            n="02"
            title="Do the drill before the next one"
            body="Each lesson ends with a short exercise on a real chart, plus a quiz that tells you whether to move on or watch it again."
            visual={<DrillVisual />}
          />
          <Step
            n="03"
            title="Bring it to Thursday live"
            body="Every week Nick reviews member work on camera and answers the queue. Miss it and the replay is in your library that night, with chapters."
            visual={<LiveVisual />}
          />
        </div>
      </Container>
    </Section>
  );
}
