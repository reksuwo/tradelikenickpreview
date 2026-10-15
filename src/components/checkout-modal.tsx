"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check } from "./ui";

export type CheckoutItem = {
  kind: "Course" | "Trading book";
  title: string;
  detail: string;
  price: string;
  /** Small cover/poster shown in the order summary. */
  visual: ReactNode;
};

/*
  Checkout pop-up. This is the UI only: no payment provider is connected yet,
  so submitting never sends card details anywhere — it shows a "preview" notice.
  Wire the submit handler to Stripe before going live.
*/

function formatCard(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

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

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12.5px] font-semibold text-ink-700">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

const INPUT =
  "w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14.5px] text-ink outline-none transition-colors placeholder:text-ink-300 focus:border-ink focus:ring-2 focus:ring-neon/40";

export function CheckoutModal({
  item,
  onClose,
}: {
  item: CheckoutItem | null;
  onClose: () => void;
}) {
  // Keyed by title so every newly opened item starts with a fresh form.
  return item ? (
    <CheckoutDialog key={item.title} item={item} onClose={onClose} />
  ) : null;
}

function CheckoutDialog({
  item,
  onClose,
}: {
  item: CheckoutItem;
  onClose: () => void;
}) {
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [done, setDone] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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

          <dl className="relative mt-8 space-y-3 border-t border-white/10 pt-6 text-[14px]">
            <div className="flex justify-between text-white/70">
              <dt>Subtotal</dt>
              <dd className="tabnum">{item.price}</dd>
            </div>
            <div className="flex justify-between text-white/70">
              <dt>Tax</dt>
              <dd>Calculated at payment</dd>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3 text-[17px] font-extrabold">
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

        {/* Payment form */}
        <div className="p-6 sm:p-8 md:order-1">
          {done ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-neon text-ink">
                <Check className="size-6" />
              </span>
              <h2
                id="checkout-title"
                className="mt-5 text-[24px] font-extrabold text-ink"
              >
                Checkout preview
              </h2>
              <p className="mt-2 max-w-sm text-[14.5px] leading-relaxed text-ink-500">
                Payments aren&rsquo;t connected yet, so nothing was charged and
                no card details were sent. Once Stripe is connected, this
                button will complete the purchase.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-7 rounded-full bg-ink px-6 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-85"
              >
                Back to browsing
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setDone(true);
              }}
            >
              <h2
                id="checkout-title"
                className="pr-10 text-[24px] font-extrabold text-ink"
              >
                Checkout
              </h2>
              <p className="mt-1 text-[14px] text-ink-500">
                Complete your purchase securely.
              </p>

              <div className="mt-6 space-y-4">
                <Field label="Email">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={INPUT}
                  />
                </Field>

                <Field label="Card number">
                  <div className="relative">
                    <input
                      inputMode="numeric"
                      autoComplete="cc-number"
                      required
                      placeholder="1234 1234 1234 1234"
                      value={card}
                      onChange={(e) => setCard(formatCard(e.target.value))}
                      className={`${INPUT} pr-24 tabnum`}
                    />
                    <span className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 gap-1">
                      {["VISA", "MC", "AMEX"].map((b) => (
                        <span
                          key={b}
                          className="rounded border border-line px-1 py-0.5 text-[8.5px] font-extrabold text-ink-500"
                        >
                          {b}
                        </span>
                      ))}
                    </span>
                  </div>
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry">
                    <input
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      required
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      className={`${INPUT} tabnum`}
                    />
                  </Field>
                  <Field label="CVC">
                    <input
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      required
                      maxLength={4}
                      placeholder="123"
                      className={`${INPUT} tabnum`}
                    />
                  </Field>
                </div>
                <Field label="Name on card">
                  <input
                    autoComplete="cc-name"
                    required
                    placeholder="Full name"
                    className={INPUT}
                  />
                </Field>

                <Field label="Country">
                  <select
                    autoComplete="country-name"
                    className={INPUT}
                    defaultValue="United States"
                  >
                    {[
                      "United States",
                      "Canada",
                      "United Kingdom",
                      "Australia",
                      "Philippines",
                      "Other",
                    ].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <button
                type="submit"
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-neon px-6 py-4 text-[15px] font-bold text-ink shadow-[0_12px_30px_-12px_rgba(0,255,133,0.7)] transition-all hover:-translate-y-0.5 hover:opacity-90"
              >
                <LockIcon className="size-4" />
                Pay {item.price}
              </button>
              <p className="mt-3 text-center text-[12px] text-ink-500">
                Payments securely processed by Stripe &middot; 30-day refund
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
