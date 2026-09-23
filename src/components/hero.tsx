import { Arrow, Container, CTA, Highlight, PlayIcon, Section, Star, type Tone } from "./ui";
import { Poster } from "./poster";
import { byId } from "@/lib/courses";

const NEXT_UP = ["first-90", "position-sizing", "live-archive"];

function FeaturedPlayer() {
  const feature = byId("complete-system");

  return (
    <div className="overflow-hidden rounded-[26px] border border-edge bg-card p-3 shadow-float">
      <div className="relative aspect-video overflow-hidden rounded-[18px]">
        <Poster variant={feature.poster} label="Complete System" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-on-accent">
          Now streaming
        </span>

        <div className="absolute inset-x-4 bottom-4">
          <p className="font-display text-[19px] font-extrabold leading-tight text-white sm:text-[22px]">
            {feature.title}
          </p>
          <p className="mt-1 text-[12px] font-medium tabnum text-white/65">
            Episode 1 &middot; How markets actually move &middot; 14 min
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-glow">
              <PlayIcon className="size-4 translate-x-px" />
            </span>
            <div className="h-1 flex-1 rounded-full bg-white/25">
              <div className="h-full w-[22%] rounded-full bg-accent" />
            </div>
            <span className="shrink-0 text-[11.5px] font-semibold tabnum text-white/60">22%</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pb-1 pt-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint">Next up</p>
        <p className="text-[12px] font-semibold text-muted">Autoplay on</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-1 pb-1">
        {NEXT_UP.map((id) => {
          const c = byId(id);
          return (
            <div key={id} className="group/next">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-edge">
                <Poster variant={c.poster} label="" />
                <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover/next:opacity-100">
                  <span className="grid size-7 place-items-center rounded-full bg-accent text-on-accent">
                    <PlayIcon className="size-3 translate-x-px" />
                  </span>
                </span>
              </div>
              <p className="mt-1.5 truncate text-[11.5px] font-semibold text-muted">{c.title}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Hero({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 size-[820px] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]"
      />
      <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-70" />

      <Container className="relative py-16 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <p className="text-[11.5px] font-extrabold uppercase tracking-[0.22em] text-accent-ink">
              TradeLikeNick Originals
            </p>

            <h1 className="mt-5 text-[clamp(2.5rem,5.4vw,4rem)] font-extrabold leading-[0.99] text-fg">
              Every trading course you need, <Highlight>streaming</Highlight> in one place.
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px] font-semibold text-muted">
              <span className="flex items-center gap-1.5 text-fg">
                <Star className="size-4 text-accent-ink" />
                4.9
              </span>
              <span className="size-1 rounded-full bg-edge" />
              <span>9 courses</span>
              <span className="size-1 rounded-full bg-edge" />
              <span>163 hours</span>
              <span className="size-1 rounded-full bg-edge" />
              <span>Beginner to advanced</span>
              <span className="rounded border border-edge px-1.5 py-0.5 text-[11px] font-bold text-faint">
                HD
              </span>
            </div>

            <p className="mt-6 max-w-xl text-[17.5px] leading-relaxed text-muted">
              Make a free account, browse the whole shelf, and watch the opening episodes of any
              course before you buy a thing. Laptop before the open, phone after the close.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CTA href="/signin" size="lg">
                <PlayIcon />
                Start watching
              </CTA>
              <CTA href="#library" variant="outline" size="lg">
                Browse the library <Arrow />
              </CTA>
            </div>

            <p className="mt-6 text-[13.5px] text-muted">
              Free to join &middot; First two episodes free &middot; No prior experience needed
            </p>
          </div>

          <div className="lg:pl-4">
            <FeaturedPlayer />
          </div>
        </div>
      </Container>
    </Section>
  );
}
