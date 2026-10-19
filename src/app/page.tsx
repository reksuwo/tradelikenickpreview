import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Stats } from "@/components/stats";
import { Roadmap } from "@/components/roadmap";
import { Library } from "@/components/library";
import { HowItWorks } from "@/components/how-it-works";
import { Curriculum } from "@/components/curriculum";
import { Audience } from "@/components/audience";
import { Instructor } from "@/components/instructor";
import { Testimonials } from "@/components/testimonials";
import { Access } from "@/components/access";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";
import { SiteFooter } from "@/components/site-footer";
import { getCourses } from "@/lib/course-store";

/*
  Section colour sequence. The page alternates all the way down:

    light = white background, neon green highlights
    dark  = black background, white highlights

  Change the order here and the whole page follows — every section reads its
  colours from the theme tokens in globals.css.
*/
export default async function Page() {
  const courses = await getCourses();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero tone="light" courses={courses} />
        <Marquee tone="dark" />
        <Stats tone="light" />
        <Roadmap tone="light" />
        <Library tone="dark" courses={courses} />
        <HowItWorks tone="light" />
        <Curriculum tone="dark" limit={4} />
        <Audience tone="dark" />
        <Instructor tone="light" />
        <Testimonials tone="dark" />
        <Access tone="light" />
        <Faq tone="dark" />
        <FinalCta tone="light" />
      </main>
      <SiteFooter tone="dark" />
    </>
  );
}
