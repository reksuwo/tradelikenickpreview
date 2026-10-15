import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-chip bg-linear-[145deg,rgba(0,255,133,0.14),transparent_65%] text-on-chip ring-1 ring-inset ring-neon/20 transition-transform duration-200 group-hover:-rotate-6">
        {/* Candlesticks: up, a red candle down, then up higher. */}
        <svg viewBox="0 0 24 24" aria-hidden className="size-6">
          <path d="M12 7.5v12" stroke="#ff4d5e" strokeWidth="1.4" strokeLinecap="round" />
          <rect x="10.4" y="9.5" width="3.2" height="8" rx="1" fill="#ff4d5e" />
          <path
            d="M6 5.5v17M18 1.5v19.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <rect x="4.2" y="7.5" width="3.6" height="13" rx="1.1" fill="currentColor" />
          <rect x="16.2" y="3" width="3.6" height="16" rx="1.1" fill="currentColor" />
        </svg>
      </span>
      <span className="text-[17px] font-extrabold tracking-[-0.04em] text-fg">
        Trade<span className="text-accent-ink">Like</span>Nick
      </span>
    </Link>
  );
}
