"use client";

import { useState } from "react";
import { CheckoutModal, courseCheckoutItem } from "../checkout-modal";
import type { Course } from "@/lib/courses";

/** "Unlock for $697": opens checkout for one course. */
export function UnlockButton({ course, className = "" }: { course: Course; className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-2 rounded-full bg-neon px-6 py-3 text-[15px] font-bold text-ink transition-all hover:-translate-y-0.5 hover:opacity-90 ${className}`}
      >
        Unlock for {course.price}
      </button>
      <CheckoutModal item={open ? courseCheckoutItem(course) : null} onClose={() => setOpen(false)} />
    </>
  );
}
