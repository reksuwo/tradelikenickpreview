import "server-only";

export type Quote = { symbol: string; change: number; points: number[] };

// Twelve Data symbols, in marquee order.
export const MARKET_SYMBOLS = [
  "EUR/USD",
  "GBP/USD",
  "USD/JPY",
  "AUD/USD",
  "USD/CAD",
  "XAU/USD",
  "AAPL",
  "TSLA",
  "NVDA",
  "MSFT",
  "AMZN",
  "SPY",
];

// Free plan: 8 credits/minute, 800/day, 1 credit per symbol. 12 symbols every
// 30 min is ~576 credits/day. Each symbol is fetched and cached on its own, so
// one rate-limited symbol doesn't sink the rest, and since Next only caches 200
// responses, a failed refresh keeps serving the last good value.
const REVALIDATE_SECONDS = 30 * 60;

type TimeSeries = {
  status?: string;
  values?: { datetime: string; close: string }[];
};

async function getQuote(symbol: string, apiKey: string): Promise<Quote | null> {
  const url = new URL("https://api.twelvedata.com/time_series");
  url.search = new URLSearchParams({
    symbol,
    interval: "1day",
    outputsize: "22", // ~1 month of trading days for the sparkline
    order: "asc",
    apikey: apiKey,
  }).toString();

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    const data = (await res.json()) as TimeSeries;
    if (data.status !== "ok" || !data.values || data.values.length < 2) return null;

    const points = data.values.map((v) => Number(v.close));
    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    if (!Number.isFinite(last) || !Number.isFinite(prev) || prev === 0) return null;

    return { symbol, change: ((last - prev) / prev) * 100, points };
  } catch {
    return null;
  }
}

/** Live quotes for every symbol that returned data. Empty without an API key. */
export async function getMarketQuotes(): Promise<Quote[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) return [];
  const quotes = await Promise.all(MARKET_SYMBOLS.map((s) => getQuote(s, apiKey)));
  return quotes.filter((q): q is Quote => q !== null);
}
