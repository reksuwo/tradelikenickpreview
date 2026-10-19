import Image from "next/image";
import { Arrow, Container, CTA, Highlight, PlayIcon, Section, Star, type Tone } from "./ui";
import { byId, type Course } from "@/lib/courses";
import { LECTURE_COURSE_ID, LECTURES, minutes } from "@/lib/lectures";

function FeaturedPlayer({ feature }: { feature: Course }) {
  const [now, ...rest] = LECTURES;
  const nextUp = rest.slice(0, 3);

  return (
    <div className="overflow-hidden rounded-[26px] border border-edge bg-card p-3 shadow-float">
      <div className="relative aspect-video overflow-hidden rounded-[18px] bg-art-dark">
        <Image
          src={now.thumbnail}
          alt={`Lecture ${now.n}: ${now.title}`}
          fill
          loading="eager"
          fetchPriority="high"
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />

        {/* Only the player bar sits on the artwork, so the thumbnail's own title stays readable. */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/75 to-transparent" />

        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.14em] text-on-accent">
          Now streaming
        </span>

        <div className="absolute inset-x-4 bottom-3.5 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent shadow-glow">
            <PlayIcon className="size-4 translate-x-px" />
          </span>
          <div className="h-1 flex-1 rounded-full bg-white/30">
            <div className="h-full w-[22%] rounded-full bg-accent" />
          </div>
          <span className="shrink-0 text-[11.5px] font-semibold tabnum text-white/80">22%</span>
        </div>
      </div>

      <div className="px-2 pt-4">
        <p className="font-display text-[19px] font-extrabold leading-tight text-fg sm:text-[21px]">
          {feature.title}
        </p>
        <p className="mt-1 text-[12.5px] font-medium tabnum text-muted">
          Lecture {now.n} &middot; {now.title} &middot; {minutes(now.seconds)}
        </p>
      </div>

      <div className="flex items-center justify-between px-2 pb-1 pt-4">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-faint">Next up</p>
        <p className="text-[12px] font-semibold text-muted">Autoplay on</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 px-1 pb-1">
        {nextUp.map((l) => (
          <div key={l.n} className="group/next">
            <div className="relative aspect-video overflow-hidden rounded-xl border border-edge bg-art-dark">
              <Image
                src={l.thumbnail}
                alt={`Lecture ${l.n}: ${l.title}`}
                fill
                sizes="(min-width: 1024px) 180px, 33vw"
                className="object-cover"
              />
              <span className="absolute inset-0 grid place-items-center bg-black/25 opacity-0 transition-opacity group-hover/next:opacity-100">
                <span className="grid size-7 place-items-center rounded-full bg-accent text-on-accent">
                  <PlayIcon className="size-3 translate-x-px" />
                </span>
              </span>
            </div>
            <p className="mt-1.5 truncate text-[11.5px] font-semibold text-muted">
              {l.n}. {l.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** `courses` is the live catalogue; the flagship falls back to the built-in copy if it's missing. */
export function Hero({ tone, courses = [] }: { tone: Tone; courses?: Course[] }) {
  const feature = courses.find((c) => c.id === LECTURE_COURSE_ID) ?? byId(LECTURE_COURSE_ID);

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
            <FeaturedPlayer feature={feature} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
