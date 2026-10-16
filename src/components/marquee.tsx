import { Container, Section, type Tone } from "./ui";
import { getMarketQuotes, MARKET_SYMBOLS, type Quote } from "@/lib/markets";

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

export async function Marquee({ tone }: { tone: Tone }) {
  // Sparkline: last ~month of daily closes. Percent: latest daily change.
  // With no data (no API key, API down) show the symbols alone, never fake numbers.
  const quotes = await getMarketQuotes();
  const items: { symbol: string; quote?: Quote }[] = quotes.length
    ? quotes.map((quote) => ({ symbol: quote.symbol, quote }))
    : MARKET_SYMBOLS.map((symbol) => ({ symbol }));

  return (
    <Section tone={tone} className="py-9">
      <Container>
        <p className="text-center text-[11.5px] font-semibold uppercase tracking-[0.2em] text-faint">
          Markets we trade
        </p>
      </Container>
      <div className="fade-x mt-6 overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-10 pr-10">
          {[...items, ...items, ...items, ...items].map(({ symbol, quote }, i) => {
            const up = (quote?.change ?? 0) >= 0;
            return (
              <span key={`${symbol}-${i}`} className="flex items-center gap-3 whitespace-nowrap">
                <span className="font-display text-[15px] font-bold tracking-[-0.03em] text-muted">
                  {symbol}
                </span>
                {quote && (
                  <>
                    <Sparkline points={quote.points} up={up} id={`spark-${i}`} />
                    <span
                      className="tabnum text-[12.5px] font-semibold"
                      style={{ color: up ? "var(--color-neon)" : "#ff4d5e" }}
                    >
                      {up ? "+" : "−"}
                      {Math.abs(quote.change).toFixed(2)}%
                    </span>
                  </>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
