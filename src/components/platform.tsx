import type { ReactNode } from "react";
import { Container, PlayIcon, Section, SectionHeading, type Tone } from "./ui";
import { Poster } from "./poster";
import { byId } from "@/lib/courses";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const FEATURES = [
  {
    title: "Download and go offline",
    body: "Save any lesson to the mobile app and watch it on the train, on a plane, or anywhere the signal drops.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M12 4v10.5M12 14.5l-4-4M12 14.5l4-4M4.5 19.5h15" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Picks up where you stopped",
    body: "Close the tab mid-lesson and your place is waiting on your phone. Progress syncs across every device you sign in on.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M20 12a8 8 0 11-2.4-5.7M20 4.5v3h-3" {...stroke} />
        <path d="M12 8v4.5l3 1.8" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Transcripts and subtitles",
    body: "Full searchable transcripts on every lesson, with subtitles in English, Spanish and Portuguese.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <rect x="3" y="5" width="18" height="14" rx="3" {...stroke} />
        <path d="M7 14h4M14 14h3" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Chapters and 2x speed",
    body: "Jump straight to the part you need, slow it down for the hard bits, or run a rewatch at double pace.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path d="M5 6.5l7 5.5-7 5.5V6.5zM14 6.5l7 5.5-7 5.5V6.5z" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Weekly live premieres",
    body: "A new live session every Thursday at 4pm ET, added to the library the same night with chapters already marked.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <circle cx="12" cy="12" r="3" {...stroke} />
        <path d="M6.5 6.5a7.8 7.8 0 000 11M17.5 6.5a7.8 7.8 0 010 11" {...stroke} />
      </svg>
    ),
  },
  {
    title: "Watch together, talk after",
    body: "A moderated members room attached to every course, so the question you have is usually already answered.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5">
        <path
          d="M20 14.5a2.5 2.5 0 01-2.5 2.5H8l-4 3.5V6.5A2.5 2.5 0 016.5 4h11A2.5 2.5 0 0120 6.5v8z"
          {...stroke}
        />
      </svg>
    ),
  },
];

function DeviceShowcase() {
  const rail = ["first-90", "position-sizing", "rules-over-feelings", "live-archive"];
  const downloads = ["journal-bootcamp", "backtesting", "prop-firm"];

  return (
    <div className="relative">
      {/* Laptop */}
      <div className="rounded-[22px] border border-edge bg-card p-3 shadow-float">
        <div className="overflow-hidden rounded-[14px] bg-art-dark">
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="size-2 rounded-full bg-white/20" />
            <span className="ml-3 rounded bg-white/10 px-2 py-0.5 text-[10.5px] text-white/50">
              watch.tradelikenick.com
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="relative aspect-21/9 overflow-hidden rounded-xl">
              <Poster variant={byId("complete-system").poster} label="Complete System" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
              <div className="absolute inset-y-0 left-0 flex max-w-[62%] flex-col justify-center gap-2 p-4 sm:p-5">
                <p className="text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-accent">
                  Continue watching
                </p>
                <p className="font-display text-[15px] font-extrabold leading-tight text-white sm:text-[18px]">
                  The Complete Trading System
                </p>
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-accent text-on-accent">
                    <PlayIcon className="size-3" />
                  </span>
                  <span className="text-[10.5px] font-semibold text-white/70">
                    Resume episode 4
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-[10.5px] font-extrabold uppercase tracking-[0.16em] text-white/45">
              Because you watched risk
            </p>
            <div className="mt-2.5 grid grid-cols-4 gap-2.5">
              {rail.map((id) => (
                <div
                  key={id}
                  className="relative aspect-video overflow-hidden rounded-lg border border-white/10"
                >
                  <Poster variant={byId(id).poster} label="" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-edge" />
      </div>

      {/* Phone */}
      <div className="absolute -bottom-10 -right-2 hidden w-[164px] rotate-3 rounded-[26px] border border-edge bg-card p-2 shadow-float sm:block lg:-right-6">
        <div className="overflow-hidden rounded-[20px] bg-art-dark px-3 pb-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/25" />
          <p className="text-[9.5px] font-extrabold uppercase tracking-[0.16em] text-accent">
            Downloads
          </p>
          <div className="mt-2.5 space-y-2.5">
            {downloads.map((id) => {
              const c = byId(id);
              return (
                <div key={id} className="flex items-center gap-2">
                  <div className="relative size-9 shrink-0 overflow-hidden rounded-md">
                    <Poster variant={c.poster} label="" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[9.5px] font-bold text-white">{c.title}</p>
                    <p className="text-[9px] tabnum text-white/45">{c.hours} &middot; saved</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-lg bg-accent px-2 py-1.5 text-center text-[9.5px] font-extrabold text-on-accent">
            Watch offline
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-edge bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-card">
      <span className="grid size-11 place-items-center rounded-xl bg-accent-soft text-accent-ink">
        {icon}
      </span>
      <h3 className="mt-5 text-[17px] font-bold text-fg">{title}</h3>
      <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function Platform({ tone }: { tone: Tone }) {
  return (
    <Section id="platform" tone={tone} className="py-20 lg:py-28">
      <Container>
        <SectionHeading
          eyebrow="The viewing experience"
          title="Watch it the way you watch everything else"
          blurb="Laptop, phone, tablet, TV. One account, one login, and your place saved on all of them."
        />

        <div className="mt-16 lg:pb-12">
          <DeviceShowcase />
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
