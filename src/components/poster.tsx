/** Accent colour follows the section theme: neon on light, white on dark. */
const ART = "var(--s-art)";

const SURFACE = [
  "bg-art-dark",
  "bg-art",
  "bg-mist",
  "bg-art-dark",
  "bg-art",
  "bg-art-dark",
  "bg-mist",
  "bg-art-dark",
  "bg-art-dark",
];

const LIGHT_SURFACE = new Set([1, 2, 4, 6]);

/**
 * Nine deterministic cover artworks. Abstract and typographic on purpose —
 * these read as course posters on a shelf, not as screenshots of software.
 */
export function Poster({ variant, label }: { variant: number; label: string }) {
  const v = variant % 9;
  const onLight = LIGHT_SURFACE.has(v);

  return (
    <div className={`relative size-full overflow-hidden ${SURFACE[v]}`}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage: onLight
            ? "linear-gradient(rgba(8,17,16,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(8,17,16,0.05) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <svg viewBox="0 0 320 180" aria-hidden className="absolute inset-0 size-full">
        {/* 0 — eclipse */}
        {v === 0 ? (
          <>
            <circle cx="248" cy="150" r="96" fill={ART} fillOpacity="0.9" />
            <circle cx="248" cy="150" r="60" fill="#101a18" fillOpacity="0.92" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={i}
                x1={-20 + i * 34}
                y1="190"
                x2={40 + i * 34}
                y2="-10"
                stroke="#ffffff"
                strokeOpacity="0.08"
                strokeWidth="10"
              />
            ))}
          </>
        ) : null}

        {/* 1 — ripple */}
        {v === 1 ? (
          <>
            {[112, 84, 56, 28].map((r, i) => (
              <circle
                key={r}
                cx="40"
                cy="150"
                r={r}
                fill="none"
                stroke="#081110"
                strokeOpacity={0.14 + i * 0.16}
                strokeWidth="14"
              />
            ))}
          </>
        ) : null}

        {/* 2 — chevrons */}
        {v === 2 ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                d={`M${40 + i * 56} 26 L${96 + i * 56} 90 L${40 + i * 56} 154`}
                fill="none"
                stroke={i === 3 ? "#081110" : "#cfd8d5"}
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </>
        ) : null}

        {/* 3 — stacked bars */}
        {v === 3 ? (
          <>
            <defs>
              <radialGradient id="p3" cx="0.7" cy="0.3" r="0.8">
                <stop offset="0%" stopColor={ART} stopOpacity="0.85" />
                <stop offset="100%" stopColor={ART} stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="320" height="180" fill="url(#p3)" />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x="24"
                y={30 + i * 26}
                width={220 - i * 40}
                height="10"
                rx="5"
                fill="#ffffff"
                fillOpacity={0.9 - i * 0.16}
              />
            ))}
          </>
        ) : null}

        {/* 4 — waves */}
        {v === 4 ? (
          <>
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M-10 ${70 + i * 40} C 60 ${20 + i * 40}, 120 ${120 + i * 40}, 200 ${70 + i * 40} S 300 ${20 + i * 40}, 340 ${70 + i * 40}`}
                fill="none"
                stroke="#081110"
                strokeOpacity={0.18 + i * 0.12}
                strokeWidth="12"
                strokeLinecap="round"
              />
            ))}
          </>
        ) : null}

        {/* 5 — burst */}
        {v === 5 ? (
          <>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <path
                key={i}
                d={`M160 180 L${20 + i * 40} -10 L${52 + i * 40} -10 Z`}
                fill={ART}
                fillOpacity={i % 2 === 0 ? 0.16 : 0.06}
              />
            ))}
            <circle cx="160" cy="176" r="26" fill={ART} />
          </>
        ) : null}

        {/* 6 — overlapping squares */}
        {v === 6 ? (
          <>
            <rect x="34" y="28" width="118" height="118" rx="14" fill="#081110" />
            <rect x="116" y="56" width="118" height="118" rx="14" fill="#5a6764" fillOpacity="0.5" />
            <rect
              x="198"
              y="20"
              width="94"
              height="94"
              rx="14"
              fill="none"
              stroke="#081110"
              strokeWidth="10"
              strokeOpacity="0.15"
            />
          </>
        ) : null}

        {/* 7 — dotted arc */}
        {v === 7 ? (
          <>
            {Array.from({ length: 30 }, (_, i) => {
              const angle = (Math.PI * (i / 29)) * 1.05 - 0.05;
              const cx = 160 + Math.cos(angle + Math.PI) * 130;
              const cy = 186 + Math.sin(angle + Math.PI) * 130;
              return (
                <circle
                  key={i}
                  cx={cx.toFixed(1)}
                  cy={cy.toFixed(1)}
                  r={i > 23 ? 7 : 4.5}
                  fill={ART}
                  fillOpacity={0.25 + (i / 29) * 0.75}
                />
              );
            })}
          </>
        ) : null}

        {/* 8 — live bars */}
        {v === 8 ? (
          <>
            <circle cx="160" cy="90" r="120" fill={ART} fillOpacity="0.07" />
            <circle cx="160" cy="90" r="82" fill={ART} fillOpacity="0.1" />
            <rect x="120" y="66" width="10" height="48" rx="5" fill={ART} />
            <rect x="142" y="52" width="10" height="76" rx="5" fill={ART} />
            <rect x="164" y="40" width="10" height="100" rx="5" fill={ART} />
            <rect x="186" y="58" width="10" height="64" rx="5" fill={ART} />
            <circle cx="262" cy="34" r="8" fill="#ff4d4d" />
          </>
        ) : null}
      </svg>

      <span
        className={`absolute bottom-3 left-4 max-w-[70%] font-display text-[13px] font-extrabold uppercase leading-tight tracking-[0.08em] ${
          onLight ? "text-ink/70" : "text-white/75"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
