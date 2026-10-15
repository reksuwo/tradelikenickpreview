"use client";

import { useState } from "react";
import { Container, Section, type Tone } from "./ui";

const FAQS = [
  {
    q: "Do I have to subscribe to anything?",
    a: "No. Create a free account, watch the opening episodes of any course, then buy only the titles you want. There is no membership to cancel, and whatever you buy stays in your library permanently, including lessons added to it later.",
  },
  {
    q: "Do I need experience to start?",
    a: "No. Episode one assumes you have never placed a trade. If you already trade, the first two episodes will take you an evening and the sizing and review material is where your time is best spent.",
  },
  {
    q: "What can I watch on?",
    a: "Any browser, the iOS and Android apps, and the Apple TV and Android TV apps. Lessons download for offline viewing on mobile, and your position in a lesson syncs across every device you sign in on.",
  },
  {
    q: "What markets does this cover?",
    a: "The examples are index futures and large-cap equities, because that is what Nick trades. The setups, risk model and review process transfer to forex and crypto without changes, though the session timing logic is built around the US open.",
  },
  {
    q: "How much capital do I need?",
    a: "You can complete every lesson and drill on a simulator with no capital at risk. Most students trade sim for six to twelve weeks before going live. When you do, the risk model works at any account size.",
  },
  {
    q: "How much time does it take each week?",
    a: "Plan on four to six hours: about two hours of video, one drill, and the Friday review. The live call is optional and always recorded.",
  },
  {
    q: "Are there signals or alerts?",
    a: "No, and there never will be. Signals make you dependent on someone else's judgement, which is the opposite of what these courses are for.",
  },
  {
    q: "Is this financial advice?",
    a: "No. TradeLikeNick is educational material only. Nothing here is personalised investment advice, and no outcome is promised or implied. Trading carries a real risk of losing money.",
  },
  {
    q: "What if it is not for me?",
    a: "Email within 30 days of purchase and we refund the full amount, no questions and no forms. You keep nothing downloaded, but we do not chase you for it either.",
  },
];

export function Faq({ tone }: { tone: Tone }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" tone={tone} className="py-20 lg:py-28">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="text-[clamp(2rem,4.2vw,2.9rem)] font-extrabold leading-[1.05] text-fg">
              Questions people ask before signing up
            </h2>
            <p className="mt-5 text-[16.5px] leading-relaxed text-muted">
              Still unsure? Email{" "}
              <span className="font-semibold text-fg underline decoration-accent decoration-[3px] underline-offset-4">
                hello@tradelikenick.com
              </span>{" "}
              and you will get a reply from a person within a day.
            </p>
          </div>

          <div className="divide-y divide-edge border-y border-edge">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                  >
                    <span className="text-[16.5px] font-bold leading-snug text-fg">{f.q}</span>
                    <span
                      className={`grid size-8 shrink-0 place-items-center rounded-full border transition-all duration-200 ${
                        isOpen
                          ? "border-accent bg-accent text-on-accent"
                          : "border-edge bg-card text-muted"
                      }`}
                    >
                      <svg viewBox="0 0 20 20" aria-hidden className="size-4">
                        <path
                          d={isOpen ? "M5 10h10" : "M10 5v10M5 10h10"}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 pr-10 text-[15.5px] leading-relaxed text-muted">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
