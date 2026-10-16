"use client";

import { useEffect, useRef, useState } from "react";
import { PASSWORD_RULES, passwordError } from "@/lib/password-rules";

const LEVELS = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-700" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-700" },
  { label: "Fair", bar: "bg-amber-400", text: "text-amber-700" },
  { label: "Good", bar: "bg-amber-400", text: "text-amber-700" },
  { label: "Strong", bar: "bg-accent", text: "text-accent-ink" },
];

/**
 * New-password input with a live strength bar and rule checklist.
 * The browser blocks submitting until every rule passes.
 */
export function PasswordField({ label = "Password", name = "password" }: { label?: string; name?: string }) {
  const [value, setValue] = useState("");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const results = PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(value) }));
  const passed = results.filter((r) => r.ok).length;
  const allPassed = passed === results.length;
  // Map 0–5 rules passed onto the 5 levels, saving "Strong" for all five.
  const level = LEVELS[allPassed ? 4 : Math.min(passed, 3)];

  // Native validation message, so the form can't submit a weak password.
  useEffect(() => {
    ref.current?.setCustomValidity(value ? (passwordError(value) ?? "") : "");
  }, [value]);

  return (
    <div>
      <label htmlFor={name} className="text-[13.5px] font-semibold text-fg">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          ref={ref}
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          placeholder="Create a strong password"
          autoComplete="new-password"
          required
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={`${name}-rules`}
          className="w-full rounded-xl border border-edge bg-card py-3 pl-4 pr-16 text-[15px] text-fg outline-none transition-all duration-200 placeholder:text-faint focus:border-accent focus:ring-4 focus:ring-accent/25"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute inset-y-0 right-3 my-auto h-fit rounded-md px-1.5 py-1 text-[12.5px] font-semibold text-muted transition-colors hover:text-fg"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      <div id={`${name}-rules`} className="mt-3" aria-live="polite">
        <div className="flex items-center gap-3">
          <div className="grid flex-1 grid-cols-5 gap-1.5" aria-hidden>
            {results.map((r, i) => (
              <span
                key={r.id}
                className={`h-1.5 rounded-full transition-colors duration-300 ${
                  value && i < (allPassed ? 5 : passed) ? level.bar : "bg-edge"
                }`}
              />
            ))}
          </div>
          <span className={`w-16 text-right text-[12.5px] font-semibold ${value ? level.text : "text-faint"}`}>
            {value ? level.label : ""}
          </span>
        </div>

        <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
          {results.map((r) => (
            <li
              key={r.id}
              className={`flex items-center gap-2 text-[13px] transition-colors ${r.ok ? "text-fg" : "text-muted"}`}
            >
              <span
                aria-hidden
                className={`grid size-4 shrink-0 place-items-center rounded-full transition-colors ${
                  r.ok ? "bg-accent text-on-accent" : "border border-edge"
                }`}
              >
                {r.ok ? (
                  <svg viewBox="0 0 12 12" className="size-2.5">
                    <path d="M2.5 6.2l2.2 2.2 4.8-4.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
              <span>
                {r.label}
                <span className="sr-only">{r.ok ? " (done)" : " (missing)"}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
