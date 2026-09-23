import { Container, Section, type Tone } from "./ui";

const LOGOS = [
  "Market Maker Weekly",
  "The Futures Desk",
  "Retail Alpha",
  "Chart & Order",
  "Prop Firm Digest",
  "Sizing Up Podcast",
];

export function Marquee({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="py-9">
      <Container>
        <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
          Featured in
        </p>
      </Container>
      <div className="fade-x mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-14 pr-14">
          {[...LOGOS, ...LOGOS, ...LOGOS, ...LOGOS].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="whitespace-nowrap font-display text-[19px] font-bold tracking-[-0.03em] text-muted"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
