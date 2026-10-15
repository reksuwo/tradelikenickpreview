import { Container, Section, type Tone } from "./ui";

type Ticker = { symbol: string; change: number; points: number[] };

// Static illustrative sparklines — not live prices.
const TICKERS: Ticker[] = [
  { symbol: "EUR/USD", change: 0.42, points: [4, 5, 3, 6, 5, 7, 6, 8, 9] },
  { symbol: "GBP/USD", change: -0.18, points: [8, 7, 8, 6, 7, 5, 6, 4, 5] },
  { symbol: "USD/JPY", change: 0.67, points: [3, 4, 4, 6, 5, 6, 8, 7, 9] },
  { symbol: "AUD/USD", change: -0.31, points: [7, 8, 6, 7, 5, 6, 4, 5, 3] },
  { symbol: "USD/CAD", change: 0.12, points: [5, 4, 6, 5, 6, 5, 7, 6, 7] },
  { symbol: "XAU/USD", change: 1.24, points: [2, 3, 3, 5, 4, 6, 7, 8, 9] },
  { symbol: "AAPL", change: 0.88, points: [4, 3, 5, 4, 6, 7, 6, 8, 8] },
  { symbol: "TSLA", change: -2.14, points: [9, 8, 9, 6, 7, 5, 4, 5, 2] },
  { symbol: "NVDA", change: 2.51, points: [2, 4, 3, 5, 6, 5, 7, 9, 9] },
  { symbol: "MSFT", change: 0.36, points: [5, 6, 5, 6, 7, 6, 7, 7, 8] },
  { symbol: "AMZN", change: -0.54, points: [7, 6, 7, 5, 6, 6, 4, 5, 4] },
  { symbol: "SPY", change: 0.21, points: [4, 5, 5, 6, 5, 6, 6, 7, 7] },
];

const W = 56;
const H = 20;

function Sparkline({ points, up, id }: { points: number[]; up: boolean; id: string }) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const step = W / (points.length - 1);
  const coords = points.map((p, i) => [i * step, H - 2 - ((p - min) / (max - min || 1)) * (H - 4)]);
  const line = coords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const color = up ? "var(--color-neon)" : "#ff4d5e";

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Marquee({ tone }: { tone: Tone }) {
  return (
    <Section tone={tone} className="py-9">
      <Container>
        <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
          Markets we trade
        </p>
      </Container>
      <div className="fade-x mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 pr-10">
          {[...TICKERS, ...TICKERS, ...TICKERS, ...TICKERS].map((t, i) => {
            const up = t.change >= 0;
            return (
              <span key={`${t.symbol}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-muted">
                  {t.symbol}
                </span>
                <Sparkline points={t.points} up={up} id={`spark-${i}`} />
                <span
                  className="tabnum text-[12.5px] font-semibold"
                  style={{ color: up ? "var(--color-neon)" : "#ff4d5e" }}
                >
                  {up ? "+" : "−"}
                  {Math.abs(t.change).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
