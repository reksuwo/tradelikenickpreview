"use client";

import { useState } from "react";

export type ChartFormat = "money" | "count" | "minutes";

function format(value: number, kind: ChartFormat, short = false) {
  if (kind === "money") {
    const dollars = value / 100;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: short && dollars >= 1000 ? "compact" : "standard",
      maximumFractionDigits: short || Number.isInteger(dollars) ? 0 : 2,
    }).format(dollars);
  }
  const n = kind === "minutes" ? value / 60 : value;
  const text = new Intl.NumberFormat("en-US", {
    notation: short && n >= 1000 ? "compact" : "standard",
    maximumFractionDigits: kind === "minutes" && n < 10 ? 1 : 0,
  }).format(n);
  return kind === "minutes" ? `${text} min` : text;
}

/**
 * A clean axis maximum: 1, 2, 2.5 or 5 times a power of ten, at or above the
 * data. Counts get an even whole number, so the middle tick isn't "0.5 people".
 */
function niceMax(max: number, whole = false): number {
  if (whole) return Math.max(2, Math.ceil(niceMax(max) / 2) * 2);
  if (max <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= max) ?? 10;
  return step * power;
}

export type ChartBucket = "day" | "week" | "month";

/** "Mon, Oct 13" / "Week of Oct 13" / "October 2026"; shorter on the axis. */
function bucketLabel(day: string, bucket: ChartBucket, long = false) {
  const date = new Date(`${day}T00:00:00Z`);
  if (bucket === "month") {
    return date.toLocaleDateString("en-US", { month: long ? "long" : "short", year: "numeric", timeZone: "UTC" });
  }
  const text = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: long && bucket === "day" ? "short" : undefined,
    timeZone: "UTC",
  });
  return long && bucket === "week" ? `Week of ${text}` : text;
}

/**
 * One series of daily values as columns: thin neon bars from a shared
 * baseline, hairline gridlines, and a tooltip on hover or keyboard focus.
 * The same numbers are available as a table below the chart.
 */
export function ColumnChart({
  data,
  kind,
  label,
  height = 180,
  showTotal = true,
  bucket = "day",
}: {
  data: { day: string; value: number }[];
  kind: ChartFormat;
  /** What the values are, for screen readers and the table header. */
  label: string;
  height?: number;
  /** Off for values that don't add up across days, like daily active learners. */
  showTotal?: boolean;
  /** What each column covers. */
  bucket?: ChartBucket;
}) {
  const [active, setActive] = useState<number | null>(null);
  // Watch time is plotted in minutes so the axis reads cleanly.
  const max = niceMax(
    Math.max(...data.map((d) => (kind === "minutes" ? d.value / 60 : kind === "money" ? d.value / 100 : d.value)), 0),
    kind === "count",
  );
  const scale = kind === "minutes" ? 60 : kind === "money" ? 100 : 1;
  const ticks = [max, max / 2, 0];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const hovered = active === null ? null : data[active];

  return (
    <figure>
      <div className="flex gap-3">
        {/* Y axis */}
        <div className="relative w-12 shrink-0 text-right text-[11.5px] tabnum text-white/40" style={{ height }}>
          {ticks.map((t, i) => (
            <span key={i} className="absolute right-0 -translate-y-1/2" style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}>
              {format(t * scale, kind, true)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height }} onPointerLeave={() => setActive(null)}>
          {/* Gridlines */}
          {ticks.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`absolute inset-x-0 h-px ${i === ticks.length - 1 ? "bg-white/20" : "bg-white/[0.07]"}`}
              style={{ top: `${(i / (ticks.length - 1)) * 100}%` }}
            />
          ))}

          {/* Columns: each slot is its own hit target, larger than the bar it holds. */}
          <div className="absolute inset-0 flex items-end gap-[2px]" role="list" aria-label={label}>
            {data.map((d, i) => {
              const h = (d.value / scale / max) * 100;
              return (
                <div
                  key={d.day}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${bucketLabel(d.day, bucket, true)}: ${format(d.value, kind)}`}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="flex h-full min-w-0 flex-1 cursor-default items-end justify-center outline-none focus-visible:bg-white/[0.06]"
                >
                  <span
                    className={`block w-full max-w-[24px] rounded-t-[4px] transition-colors ${
                      active === i ? "bg-neon-bright" : "bg-neon"
                    } ${active !== null && active !== i ? "opacity-60" : ""}`}
                    style={{ height: d.value > 0 ? `max(${h}%, 2px)` : 0 }}
                  />
                </div>
              );
            })}
          </div>

          {/* Tooltip */}
          {hovered && active !== null ? (
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-lg border border-white/12 bg-[#121514] px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.9)]"
              style={{ left: `clamp(48px, ${((active + 0.5) / data.length) * 100}%, calc(100% - 48px))` }}
            >
              <p className="text-[14px] font-bold text-white">{format(hovered.value, kind)}</p>
              <p className="text-[12px] text-white/55">{bucketLabel(hovered.day, bucket, true)}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* X axis: first, middle and last day */}
      <div className="ml-[60px] mt-2 flex justify-between text-[11.5px] tabnum text-white/40">
        {data.length ? (
          <>
            <span>{bucketLabel(data[0].day, bucket)}</span>
            {data.length > 2 ? <span>{bucketLabel(data[Math.floor(data.length / 2)].day, bucket)}</span> : null}
            <span>{bucketLabel(data[data.length - 1].day, bucket)}</span>
          </>
        ) : null}
      </div>

      <details className="mt-3 text-[13px] text-white/55">
        <summary className="cursor-pointer select-none font-semibold hover:text-white">Show as table</summary>
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-white/10">
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/45">
                <th className="px-3 py-2 font-semibold">{bucket === "day" ? "Day" : bucket === "week" ? "Week" : "Month"}</th>
                <th className="px-3 py-2 text-right font-semibold">{label}</th>
              </tr>
            </thead>
            <tbody className="tabnum">
              {data.map((d) => (
                <tr key={d.day} className="border-t border-white/[0.06]">
                  <td className="px-3 py-1.5">{bucketLabel(d.day, bucket, true)}</td>
                  <td className="px-3 py-1.5 text-right text-white/80">{format(d.value, kind)}</td>
                </tr>
              ))}
              {showTotal ? (
                <tr className="border-t border-white/15 font-bold text-white">
                  <td className="px-3 py-2">Total</td>
                  <td className="px-3 py-2 text-right">{format(total, kind)}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
