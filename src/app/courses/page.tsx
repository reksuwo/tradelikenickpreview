import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CourseCatalog } from "@/components/course-catalog";
import { Curriculum } from "@/components/curriculum";
import { FinalCta } from "@/components/final-cta";
import { Arrow, Container, CTA, Highlight, Section } from "@/components/ui";
import { getCourses } from "@/lib/course-store";

export const metadata: Metadata = {
  title: "Courses — TradeLikeNick",
  description:
    "Every TradeLikeNick course in one place: options, probability, risk management and disciplined strategies, from beginner to advanced.",
};

export default async function CoursesPage() {
  const courses = await getCourses();
  const totalLessons = courses.reduce((sum, c) => sum + (parseInt(c.lessons, 10) || 0), 0);
  const summary = [
    { value: String(courses.length), label: "Courses" },
    { value: `${totalLessons}+`, label: "Lessons" },
    { value: "Free", label: "First two episodes" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section tone="light" className="relative overflow-hidden">
          <div aria-hidden className="dotgrid pointer-events-none absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
          />
          <Container className="relative py-20 text-center lg:py-28">
            <h1 className="mx-auto max-w-4xl text-[clamp(2.4rem,5.6vw,4rem)] font-extrabold leading-[1.02] text-fg">
              Learn to trade with <Highlight>probability</Highlight> on your side
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-muted">
              Structured courses on options, risk management and disciplined strategies. Start
              with the foundations or go straight to the skill you need. Watch the opening
              episodes free, then unlock the courses you want.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CTA href="#all-courses" size="lg">
                Browse all courses <Arrow />
              </CTA>
              <CTA href="/signin" variant="outline" size="lg">
                Watch free episodes
              </CTA>
            </div>

            <dl className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
              {summary.map((s) => (
                <div key={s.label} className="rounded-2xl border border-edge bg-card px-5 py-5 shadow-card">
                  <dt className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {s.label}
                  </dt>
                  <dd className="mt-1.5 font-display text-[30px] font-extrabold leading-none tabnum text-fg">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
          </Container>
        </Section>

        <CourseCatalog tone="dark" courses={courses} />
        <Curriculum tone="dark" />
        <FinalCta tone="light" />
      </main>
      <SiteFooter tone="dark" />
    </>
  );
}
