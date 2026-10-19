import { Poster } from "../poster";
import { ActionForm, Submit } from "./action-form";
import { BUTTON, INPUT, LABEL } from "./admin-ui";
import type { ActionState } from "@/lib/admin-actions";
import type { CourseRecord } from "@/lib/course-store";
import { POSTER_VARIANTS } from "@/lib/courses";

const LEVELS = ["All levels", "Beginner", "Intermediate", "Advanced", "Essential"];

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={LABEL}>
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-[12.5px] text-white/40">{hint}</p> : null}
    </div>
  );
}

/**
 * Every editable detail of a course. Used to create one (no `course`) and to
 * edit one. The web address is fixed once a course exists, because purchases
 * and lectures point at it.
 */
export function CourseForm({
  action,
  course,
  categories,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  course?: CourseRecord;
  /** Existing categories, suggested as you type. */
  categories: string[];
}) {
  const dollars = course?.priceCents != null ? (course.priceCents / 100).toFixed(course.priceCents % 100 ? 2 : 0) : "";

  return (
    <ActionForm action={action} className="space-y-5">
      {course ? <input type="hidden" name="id" value={course.id} /> : null}

      <Field id="title" label="Title">
        <input id="title" name="title" required minLength={2} maxLength={120} defaultValue={course?.title} className={INPUT} />
      </Field>

      {course ? null : (
        <Field id="id" label="Web address" hint="Leave empty to make one from the title. Can't be changed later.">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-[13.5px] text-white/40">/browse/watch/</span>
            <input id="id" name="id" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={60} placeholder="position-sizing" className={INPUT} />
          </div>
        </Field>
      )}

      <Field id="blurb" label="Description" hint="One or two sentences, shown on course cards and the details dialog.">
        <textarea id="blurb" name="blurb" rows={3} maxLength={600} defaultValue={course?.blurb} className={INPUT} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="category" label="Category" hint="Courses are grouped and filtered by this.">
          <input id="category" name="category" required maxLength={40} list="course-categories" defaultValue={course?.category} className={INPUT} />
          <datalist id="course-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field id="level" label="Level">
          <input id="level" name="level" maxLength={40} list="course-levels" defaultValue={course?.level ?? "All levels"} className={INPUT} />
          <datalist id="course-levels">
            {LEVELS.map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
        </Field>
        <Field id="hours" label="Length" hint='Shown as written, like "9 hrs".'>
          <input id="hours" name="hours" maxLength={30} defaultValue={course?.hours} placeholder="9 hrs" className={INPUT} />
        </Field>
        <Field id="lessons" label="Lessons" hint='Shown as written, like "26 lessons".'>
          <input id="lessons" name="lessons" maxLength={40} defaultValue={course?.lessons} placeholder="26 lessons" className={INPUT} />
        </Field>
      </div>

      <fieldset className="rounded-xl border border-white/10 p-4">
        <legend className="px-1 text-[13px] font-semibold text-white/70">Price</legend>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[15px] text-white/50">$</span>
            <input
              name="price"
              inputMode="decimal"
              aria-label="Price in US dollars"
              defaultValue={dollars}
              placeholder="149"
              className={`${INPUT} w-32 tabnum`}
            />
          </div>
          <label className="flex items-center gap-2.5 text-[14px]">
            <input type="checkbox" name="included" defaultChecked={course ? course.priceCents == null : false} className="size-4 accent-[#00ff85]" />
            <span>
              <span className="font-semibold text-white">Included</span>
              <span className="text-white/45"> — free for every member, no checkout</span>
            </span>
          </label>
        </div>
        <p className="mt-2 text-[12.5px] text-white/40">Checkout charges this price. Changing it doesn&apos;t affect anyone who already bought.</p>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="badge" label="Badge" hint='Optional ribbon on the card, like "Flagship".'>
          <input id="badge" name="badge" maxLength={30} defaultValue={course?.badge} className={INPUT} />
        </Field>
        <Field id="rating" label="Rating" hint="Optional, out of 5, like 4.8.">
          <input id="rating" name="rating" inputMode="decimal" pattern="[0-5](\.[0-9])?" defaultValue={course?.rating} className={`${INPUT} w-28`} />
        </Field>
      </div>

      <fieldset>
        <legend className={LABEL}>Poster</legend>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
          {Array.from({ length: POSTER_VARIANTS }, (_, v) => (
            <label
              key={v}
              className="relative block aspect-video cursor-pointer overflow-hidden rounded-lg ring-1 ring-white/15 transition-shadow has-[:checked]:ring-2 has-[:checked]:ring-neon has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-white"
            >
              <input type="radio" name="poster" value={v} defaultChecked={(course?.poster ?? 0) === v} className="sr-only" />
              <span className="sr-only">Poster {v + 1}</span>
              <Poster variant={v} label="" />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-xl border border-white/10 p-4 text-[14px]">
        <input type="checkbox" name="published" defaultChecked={course ? course.published : true} className="mt-1 size-4 accent-[#00ff85]" />
        <span>
          <span className="font-semibold text-white">Show in the catalogue</span>
          <span className="block text-[12.5px] text-white/45">
            Hidden courses disappear from the site and can&apos;t be bought. People who own one can still watch it.
          </span>
        </span>
      </label>

      <Submit className={BUTTON} pending={course ? "Saving…" : "Creating…"}>
        {course ? "Save course" : "Create course"}
      </Submit>
    </ActionForm>
  );
}
