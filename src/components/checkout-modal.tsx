"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { startCheckout } from "@/lib/checkout-actions";
import type { Course } from "@/lib/courses";
import type { ProductRef } from "@/lib/products";
import { Poster } from "./poster";
import { Check } from "./ui";

export type CheckoutItem = {
  /** Which catalogue item to charge for; the server looks up its price. */
  ref: ProductRef;
  kind: "Course" | "Trading book";
  title: string;
  detail: string;
  price: string;
  /** Small cover/poster shown in the order summary. */
  visual: ReactNode;
};

export function courseCheckoutItem(course: Course): CheckoutItem {
  return {
    ref: { type: "course", id: course.id },
    kind: "Course",
    title: course.title,
    detail: `${course.level} · ${course.lessons} · ${course.hours}`,
    price: course.price,
    visual: (
      <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10">
        <Poster variant={course.poster} label={course.category} />
      </div>
    ),
  };
}

/*
  Checkout pop-up. The payment form is Stripe's Embedded Checkout, so card
  details go straight to Stripe and never touch this site. When payment
  succeeds Stripe sends the buyer to /account/billing, where the order shows.
*/

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

// Load Stripe.js once, the first time someone opens checkout.
let stripePromise: Promise<Stripe | null> | undefined;
function getStripe() {
  stripePromise ??= loadStripe(PUBLISHABLE_KEY!);
  return stripePromise;
}

type Status =
  | { state: "loading" }
  | { state: "ready"; clientSecret: string }
  | { state: "signin" }
  | { state: "error"; message: string };

function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect
        x="5"
        y="10.5"
        width="14"
        height="10"
        rx="2.2"
        fill="currentColor"
      />
      <path
        d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckoutModal({
  item,
  onClose,
}: {
  item: CheckoutItem | null;
  onClose: () => void;
}) {
  // Keyed by item so every newly opened item starts a fresh checkout.
  return item ? (
    <CheckoutDialog
      key={`${item.ref.type}:${item.ref.id}`}
      item={item}
      onClose={onClose}
    />
  ) : null;
}

function CheckoutDialog({
  item,
  onClose,
}: {
  item: CheckoutItem;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>(() =>
    PUBLISHABLE_KEY
      ? { state: "loading" }
      : {
          state: "error",
          message:
            "Payments aren't set up yet. Add the Stripe keys to .env and restart the server.",
        },
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const { type, id } = item.ref;

  // Esc to close, lock page scroll, move focus into the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Ask the server for a Checkout Session for this item.
  useEffect(() => {
    if (!PUBLISHABLE_KEY) return;
    let live = true;
    startCheckout({ type, id }).then(
      (result) => {
        if (!live) return;
        if ("clientSecret" in result) {
          setStatus({ state: "ready", clientSecret: result.clientSecret });
        } else if ("signIn" in result) {
          setStatus({ state: "signin" });
        } else {
          setStatus({ state: "error", message: result.error });
        }
      },
      () =>
        live &&
        setStatus({
          state: "error",
          message: "We couldn't start checkout. Check your connection and try again.",
        }),
    );
    return () => {
      live = false;
    };
  }, [type, id]);

  const next = encodeURIComponent(pathname);

  return (
    <div className="theme-light fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close checkout"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        tabIndex={-1}
        className="relative grid max-h-[92vh] w-full max-w-[880px] overflow-y-auto rounded-t-[28px] bg-white shadow-float outline-none sm:rounded-[28px] md:grid-cols-[0.9fr_1.1fr]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-black/5 text-ink transition-colors hover:bg-black/10 md:bg-white/10 md:text-white md:hover:bg-white/20"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-4">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Order summary */}
        <aside className="relative overflow-hidden bg-ink p-6 text-white sm:p-8 md:order-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-neon/20 blur-3xl"
          />
          <p className="relative text-[11.5px] font-bold uppercase tracking-[0.16em] text-neon">
            Order summary
          </p>

          <div className="relative mt-6 flex gap-4 md:flex-col">
            <div className="w-24 shrink-0 md:w-40">{item.visual}</div>
            <div>
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {item.kind}
              </p>
              <p className="mt-1 font-display text-[19px] font-extrabold leading-snug">
                {item.title}
              </p>
              <p className="mt-1 text-[13px] text-white/60">{item.detail}</p>
            </div>
          </div>

          <dl className="relative mt-8 border-t border-white/10 pt-6 text-[17px] font-extrabold">
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="tabnum">{item.price}</dd>
            </div>
          </dl>

          <ul className="relative mt-8 space-y-2.5 text-[13px] text-white/75">
            {["Instant access after payment", "30-day refund guarantee"].map(
              (t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <span className="grid size-5 place-items-center rounded-full bg-neon/15 text-neon">
                    <Check className="size-3" />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
        </aside>

        {/* Payment */}
        <div className="p-6 sm:p-8 md:order-1">
          <h2
            id="checkout-title"
            className="pr-10 text-[24px] font-extrabold text-ink"
          >
            Checkout
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-500">
            <LockIcon className="size-3.5" />
            Payments securely processed by Stripe
          </p>

          <div className="mt-6">
            {status.state === "ready" ? (
              <EmbeddedCheckoutProvider
                stripe={getStripe()}
                options={{ clientSecret: status.clientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            ) : status.state === "signin" ? (
              <div className="rounded-2xl border border-line p-6">
                <p className="text-[16px] font-bold text-ink">
                  Sign in to buy
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-ink-500">
                  Purchases are added to your TradeLikeNick account so you can
                  watch or download them anywhere.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href={`/signin?next=${next}`}
                    className="rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-85"
                  >
                    Sign in
                  </Link>
                  <Link
                    href={`/signup?next=${next}`}
                    className="rounded-full border border-line px-6 py-3 text-[14px] font-semibold text-ink transition-colors hover:border-ink"
                  >
                    Create an account
                  </Link>
                </div>
              </div>
            ) : status.state === "error" ? (
              <div
                role="alert"
                className="rounded-2xl border border-line p-6 text-[14.5px] leading-relaxed text-ink-700"
              >
                {status.message}
              </div>
            ) : (
              <div
                role="status"
                className="flex min-h-[320px] items-center justify-center gap-3 text-[14px] text-ink-500"
              >
                <span className="size-5 animate-spin rounded-full border-2 border-line border-t-ink" />
                Loading secure checkout…
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
