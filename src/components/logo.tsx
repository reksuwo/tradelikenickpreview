import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-chip text-on-chip transition-transform duration-200 group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" aria-hidden className="size-5">
          <path
            d="M4 18V11M4 11l5-5 4 4 7-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="3" r="2" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.04em] text-fg">
        Trade<span className="text-accent-ink">Like</span>Nick
      </span>
    </Link>
  );
}
