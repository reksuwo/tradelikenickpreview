import Link from "next/link";
import { Container, type Tone } from "./ui";
import { Logo } from "./logo";

const COLUMNS = [
  {
    title: "Watch",
    links: [
      { label: "The library", href: "/#library" },
      { label: "How it works", href: "/#how" },
      { label: "Courses", href: "/courses" },
      { label: "Trading Books", href: "/books" },
      { label: "Live sessions", href: "/#library" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/signin" },
      { label: "Create an account", href: "/signup" },
      { label: "Offline downloads", href: "/#faq" },
      { label: "Help centre", href: "/#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Nick", href: "/#instructor" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/terms" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Refund policy", href: "/terms#refunds" },
      { label: "Risk disclosure", href: "/terms#risk" },
    ],
  },
];

const SOCIALS = [
  {
    label: "X",
    path: "M4 3h4.2l3.6 5 3.9-5H20l-5.9 7.4L20.4 21h-4.2l-3.8-5.3L8.2 21H4l6.2-7.8L4 3z",
  },
  {
    label: "YouTube",
    path: "M21 8.4c-.2-1.4-.8-2.1-2.2-2.3C17 5.9 14.7 5.8 12 5.8s-5 .1-6.8.3C3.8 6.3 3.2 7 3 8.4 2.8 9.6 2.8 11 2.8 12s0 2.4.2 3.6c.2 1.4.8 2.1 2.2 2.3 1.8.2 4.1.3 6.8.3s5-.1 6.8-.3c1.4-.2 2-.9 2.2-2.3.2-1.2.2-2.6.2-3.6s0-2.4-.2-3.6zM10.2 15.3V8.7l5.4 3.3-5.4 3.3z",
  },
  {
    label: "Instagram",
    path: "M12 2.8c-2.5 0-2.8 0-3.8.1-1 0-1.6.2-2.2.4-.6.3-1 .6-1.5 1s-.8.9-1 1.5c-.2.6-.4 1.2-.4 2.2-.1 1-.1 1.3-.1 3.8s0 2.8.1 3.8c0 1 .2 1.6.4 2.2.3.6.6 1 1 1.5s.9.8 1.5 1c.6.2 1.2.4 2.2.4 1 .1 1.3.1 3.8.1s2.8 0 3.8-.1c1 0 1.6-.2 2.2-.4.6-.3 1-.6 1.5-1s.8-.9 1-1.5c.2-.6.4-1.2.4-2.2.1-1 .1-1.3.1-3.8s0-2.8-.1-3.8c0-1-.2-1.6-.4-2.2-.3-.6-.6-1-1-1.5s-.9-.8-1.5-1c-.6-.2-1.2-.4-2.2-.4-1-.1-1.3-.1-3.8-.1zm0 4.4a4.8 4.8 0 110 9.6 4.8 4.8 0 010-9.6zm0 1.8a3 3 0 100 6 3 3 0 000-6zm5-2.1a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z",
  },
];

export function SiteFooter({ tone }: { tone: Tone }) {
  return (
    <footer className={`theme-${tone} bg-surface pt-16`}>
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-[14.5px] leading-relaxed text-muted">
              A risk-first trading education company. We teach process, journaling and position
              sizing &mdash; not predictions.
            </p>
            <div className="mt-6 flex gap-2.5">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid size-10 place-items-center rounded-xl border border-edge text-muted transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
                >
                  <svg viewBox="0 0 24 24" aria-hidden className="size-4.5">
                    <path d={s.path} fill="currentColor" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-fg">
                  {col.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[14px] text-muted transition-colors hover:text-accent-ink"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rounded-2xl border border-edge bg-card p-5">
          <p className="text-[11.5px] font-bold uppercase tracking-[0.14em] text-fg">
            Risk disclosure
          </p>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
            Trading futures, stocks, forex and derivatives involves substantial risk of loss and is
            not suitable for every investor. Past performance is not indicative of future results.
            All content on this site is educational and general in nature; it is not personalised
            investment, legal or tax advice, and TradeLikeNick is not a registered broker-dealer or
            investment adviser. Hypothetical or simulated results have inherent limitations and do
            not represent actual trading. You alone are responsible for your trading decisions.
            Never risk money you cannot afford to lose.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-edge py-7 sm:flex-row">
          <p className="text-[13px] text-faint">
            &copy; {new Date().getFullYear()} TradeLikeNick. All rights reserved.
          </p>
          <p className="text-[13px] text-faint">Built for traders who like boring rules.</p>
        </div>
      </Container>
    </footer>
  );
}
