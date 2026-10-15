/**
 * Animated trading backdrop: a zoomed-out view of a full chart — candles,
 * moving averages, volume, price scale, time axis and a live last candle —
 * scrolling sideways forever like a live market. Drawn in SVG so there is no
 * GIF to download. Generated from a seeded random walk so server and client
 * render the same candles.
 */

const W = 2000; // width of one chart tile; two tiles side by side loop seamlessly
const H = 600;
const STEP = 8;
const COUNT = W / STEP;
const PRICE_TOP = H * 0.12;
const PRICE_BOTTOM = H * 0.74;
const VOL_BOTTOM = H * 0.96;
const VOL_MAX = H * 0.14;

const UP = "#00d770";
const DOWN = "#ff4d5e";

type Candle = {
  x: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
};

function buildCandles(): Candle[] {
  let seed = 11;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };

  const mid = (PRICE_TOP + PRICE_BOTTOM) / 2;
  const candles: Candle[] = [];
  let price = mid;
  let trend = 0;
  for (let i = 0; i < COUNT; i++) {
    // Slowly changing trend gives runs of up and down moves, like a real chart.
    if (i % 30 === 0) trend = (rand() - 0.5) * 5;
    // Drift back to the middle near the end so the tile joins up with itself.
    const pull = i > COUNT * 0.85 ? (mid - price) * 0.12 : 0;
    const move = (rand() - 0.5) * 16 + trend + pull;
    const open = price;
    const close = Math.min(PRICE_BOTTOM, Math.max(PRICE_TOP, price - move));
    const high = Math.min(open, close) - rand() * 7 - 1;
    const low = Math.max(open, close) + rand() * 7 + 1;
    const volume = 0.25 + rand() * 0.55 + Math.min(0.2, Math.abs(close - open) / 40);
    candles.push({ x: i * STEP + STEP / 2, open, close, high, low, volume });
    price = close;
  }
  return candles;
}

function movingAverage(candles: Candle[], period: number) {
  return candles
    .map((c, i) => {
      const from = Math.max(0, i - period + 1);
      const slice = candles.slice(from, i + 1);
      const avg = slice.reduce((s, k) => s + k.close, 0) / slice.length;
      return `${i ? "L" : "M"}${c.x} ${avg.toFixed(1)}`;
    })
    .join(" ");
}

const CANDLES = buildCandles();
const MA_FAST = movingAverage(CANDLES, 9);
const MA_SLOW = movingAverage(CANDLES, 30);

function Tile({ offset }: { offset: number }) {
  return (
    <g transform={`translate(${offset} 0)`}>
      {CANDLES.map((c) => {
        const up = c.close <= c.open;
        const color = up ? UP : DOWN;
        const top = Math.min(c.open, c.close);
        const body = Math.max(1.2, Math.abs(c.close - c.open));
        const vol = c.volume * VOL_MAX;
        return (
          <g key={c.x}>
            <rect x={c.x - 2.5} y={VOL_BOTTOM - vol} width="5" height={vol} fill={color} opacity="0.35" />
            <line x1={c.x} x2={c.x} y1={c.high} y2={c.low} stroke={color} strokeWidth="1" />
            <rect x={c.x - 2.5} y={top} width="5" height={body} fill={color} />
          </g>
        );
      })}
      <path d={MA_FAST} fill="none" stroke="#f5c542" strokeWidth="1.4" strokeOpacity="0.8" />
      <path d={MA_SLOW} fill="none" stroke="#5aa9ff" strokeWidth="1.4" strokeOpacity="0.8" />
    </g>
  );
}

// Fixed price scale and time axis labels (decorative).
const PRICES = ["4,560.00", "4,540.00", "4,520.00", "4,500.00", "4,480.00", "4,460.00"];
const TIMES = ["09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];

export function ChartBackdrop({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-[0.45]">
        {/* Price gridlines + scale */}
        <div className="absolute inset-x-0 top-[12%] bottom-[26%] flex flex-col justify-between">
          {PRICES.map((p) => (
            <div key={p} className="flex items-center gap-2">
              <span className="h-px flex-1 bg-fg/10" />
              <span className="w-16 font-mono text-[10px] tabnum text-fg/50">{p}</span>
            </div>
          ))}
        </div>

        {/* Vertical time gridlines + labels */}
        <div className="absolute inset-y-0 left-0 right-[72px] flex justify-between px-[4%]">
          {TIMES.map((t) => (
            <div key={t} className="flex flex-col items-center">
              <span className="w-px flex-1 bg-fg/[0.06]" />
              <span className="pb-2 pt-1 font-mono text-[10px] tabnum text-fg/45">{t}</span>
            </div>
          ))}
        </div>

        {/* Scrolling candles, volume and moving averages */}
        <div className="absolute inset-y-0 left-0 right-[72px] overflow-hidden">
          <div className="flex h-full w-max animate-[marquee_60s_linear_infinite]">
            <svg viewBox={`0 0 ${W * 2} ${H}`} className="h-full w-auto" preserveAspectRatio="xMinYMid meet">
              <Tile offset={0} />
              <Tile offset={W} />
            </svg>
          </div>
        </div>

        {/* Live last candle and current-price line, moving together */}
        <div className="absolute right-[76px] top-[44%] h-14 w-[7px]">
          <span className="absolute inset-y-0 left-[3px] w-px bg-[#00d770]" />
          <span className="absolute inset-x-0 bottom-4 h-8 origin-bottom animate-[live-candle_2.4s_ease-in-out_infinite] rounded-[1px] bg-[#00d770]" />
        </div>
        <div className="absolute inset-x-0 top-[calc(44%+8px)] flex -translate-y-1/2 animate-[live-price_2.4s_ease-in-out_infinite] items-center">
          <span className="h-px flex-1 border-t border-dashed border-[#00d770]/70" />
          <span className="w-[72px] rounded-l bg-[#00d770] px-1.5 py-0.5 font-mono text-[10px] font-bold tabnum text-black">
            4,512.25
          </span>
        </div>
      </div>

      {/* Soft vignette so content stays readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,var(--s-bg)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-1/3 bg-linear-to-r from-(--s-bg)/80 to-transparent" />
    </div>
  );
}
