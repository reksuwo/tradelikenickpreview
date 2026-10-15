import type { Book } from "@/lib/books";

function Art({ kind, color }: { kind: Book["art"]; color: string }) {
  switch (kind) {
    case "candles":
      return (
        <g>
          {[
            [20, 120, 150, 98, 170],
            [40, 104, 128, 90, 140],
            [60, 112, 132, 100, 146],
            [80, 88, 110, 74, 122],
            [100, 92, 104, 80, 116],
            [120, 66, 90, 54, 100],
            [140, 72, 84, 60, 96],
            [160, 44, 70, 32, 80],
          ].map(([x, top, bottom, hi, lo], i) => (
            <g key={x} opacity={i === 2 || i === 4 || i === 6 ? 0.55 : 1}>
              <line x1={x} x2={x} y1={hi} y2={lo} stroke={color} strokeWidth="2" />
              <rect x={x - 6} y={top} width="12" height={bottom - top} rx="2" fill={color} />
            </g>
          ))}
        </g>
      );
    case "curve":
      return (
        <g fill="none" stroke={color} strokeLinecap="round">
          <path d="M0 150 C40 150 50 60 90 60 S140 150 180 150" strokeWidth="3" />
          <path d="M0 150 C40 150 50 85 90 85 S140 150 180 150" strokeWidth="2" opacity="0.5" />
          <path d="M0 150 C40 150 50 108 90 108 S140 150 180 150" strokeWidth="1.5" opacity="0.3" />
          <line x1="90" y1="40" x2="90" y2="160" strokeWidth="1.5" strokeDasharray="4 5" opacity="0.6" />
        </g>
      );
    case "rings":
      return (
        <g fill="none" stroke={color}>
          {[70, 54, 38, 22].map((r, i) => (
            <circle key={r} cx="90" cy="100" r={r} strokeWidth={i === 3 ? 10 : 3} opacity={1 - i * 0.18} />
          ))}
        </g>
      );
    case "grid":
      return (
        <g stroke={color} fill="none">
          {Array.from({ length: 7 }, (_, i) => (
            <line key={`h${i}`} x1="10" x2="170" y1={40 + i * 20} y2={40 + i * 20} strokeWidth="1" opacity="0.35" />
          ))}
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} y1="40" y2="160" x1={10 + i * 20} x2={10 + i * 20} strokeWidth="1" opacity="0.35" />
          ))}
          <path d="M10 150 L50 130 L70 138 L110 90 L130 100 L170 50" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="170" cy="50" r="5" fill={color} />
        </g>
      );
    case "bars":
      return (
        <g fill={color}>
          {[40, 62, 50, 84, 72, 104, 120].map((h, i) => (
            <rect key={i} x={14 + i * 23} y={160 - h} width="15" height={h} rx="2" opacity={0.4 + i * 0.1} />
          ))}
        </g>
      );
  }
}

/** A designed book cover with a spine, page edges and a slight 3D tilt on hover. */
export function BookCover({ book }: { book: Book }) {
  const [from, to] = book.cover;
  return (
    <div className="[perspective:1200px]">
      <div className="relative aspect-[2/3] transition-transform duration-300 [transform-style:preserve-3d] group-hover:[transform:rotateY(-14deg)_translateY(-4px)]">
        {/* Page edges */}
        <div
          aria-hidden
          className="absolute inset-y-[3px] -right-[7px] w-3 rounded-r-sm"
          style={{
            background:
              "repeating-linear-gradient(90deg, #f4f1ea 0 1px, #d9d4c7 1px 2px)",
            transform: "translateZ(-1px)",
          }}
        />

        {/* Cover */}
        <div
          className="absolute inset-0 overflow-hidden rounded-l-[4px] rounded-r-[8px] shadow-[0_24px_40px_-18px_rgba(0,0,0,0.55)]"
          style={{ backgroundImage: `linear-gradient(160deg, ${from}, ${to})` }}
        >
          {/* Spine */}
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-[10%]"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.12) 40%, rgba(0,0,0,0.15))",
            }}
          />
          {/* Sheen */}
          <span
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.18),transparent_40%)]"
          />

          <div className="relative flex h-full flex-col py-[9%] pl-[16%] pr-[9%]">
            <p
              className="text-[9px] font-extrabold uppercase tracking-[0.22em]"
              style={{ color: book.accent }}
            >
              TradeLikeNick
            </p>

            <svg viewBox="0 0 180 180" aria-hidden className="my-auto w-full">
              <Art kind={book.art} color={book.accent} />
            </svg>

            <h3 className="font-display text-[clamp(15px,1.5vw,19px)] font-extrabold leading-[1.05] text-white">
              {book.title}
            </h3>
            <p className="mt-1.5 text-[10.5px] leading-snug text-white/70">{book.subtitle}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-px flex-1" style={{ backgroundColor: book.accent, opacity: 0.6 }} />
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/80">
                Nick Pham
              </span>
            </div>
          </div>
        </div>

        {book.badge ? (
          <span className="absolute -right-2 -top-2 rounded-full bg-neon px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.1em] text-ink shadow-lg">
            {book.badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}
