import { Container, Section, type Tone } from "./ui";

const STATS = [
  { value: "9", label: "Courses streaming" },
  { value: "163 hrs", label: "Total runtime" },
  { value: "4,800+", label: "Members watching" },
  { value: "4.9/5", label: "Average rating" },
];

export function Stats({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="py-12">
      <Container>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-6">
          {STATS.map((s) => (
            <div key={s.label} className="text-center lg:text-left">
              <p className="font-display text-[clamp(2rem,4vw,2.9rem)] font-extrabold leading-none tabnum text-accent-ink">
                {s.value}
              </p>
              <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.14em] text-faint">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
