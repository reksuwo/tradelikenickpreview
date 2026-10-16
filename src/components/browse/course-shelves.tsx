"use client";

import { useState } from "react";
import { BrowseHero } from "./browse-hero";
import { CourseModal } from "./course-modal";
import { CourseRow, type RowItem } from "./course-row";
import type { Course } from "@/lib/courses";

export type Shelf = { id?: string; title: string; items: RowItem[]; ranked?: boolean };

/** An optional hero and a stack of scrolling rows, sharing one details dialog. */
export function CourseShelves({ featured, rows }: { featured?: Course; rows: Shelf[] }) {
  const [selected, setSelected] = useState<Course | null>(null);

  return (
    <>
      {featured ? <BrowseHero course={featured} onInfo={() => setSelected(featured)} /> : null}

      <div className={`space-y-9 ${featured ? "mt-10" : ""}`}>
        {rows.map((row) => (
          <CourseRow
            key={row.title}
            id={row.id}
            title={row.title}
            items={row.items}
            ranked={row.ranked}
            onOpen={setSelected}
          />
        ))}
      </div>

      <CourseModal course={selected} onClose={() => setSelected(null)} />
    </>
  );
}

/** Title block for member pages that have no hero. */
export function BrowseHeading({ title, intro }: { title: string; intro: string }) {
  return (
    <div className="px-4 pb-4 pt-6 sm:px-8 lg:px-[60px] lg:pt-10">
      <h1 className="text-[clamp(1.9rem,3.6vw,2.6rem)] font-extrabold leading-tight text-white">{title}</h1>
      <p className="mt-2 max-w-xl text-[15.5px] leading-relaxed text-white/60">{intro}</p>
    </div>
  );
}
