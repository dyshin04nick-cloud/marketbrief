// Unified asset data service: one Quote/Chart shape across all asset classes,
// so the UI never cares which upstream provider served the data.
import { Asset, byId, CRYPTO } from "@/config/universe";
import { getChart, getFundamentals, Quote as YQuote, Fundamentals } from "./yahoo";
import { coinMarkets, coinOhlc, coinChart } from "./coingecko";
import { fredSeries, SeriesPoint } from "./fred";
import { jgbSeries } from "./mof";
import { tickerNews, cryptoNews, macroNews, NewsItem } from "./news";

export interface UQuote {
  id: string; name: string; cls: string; country: string; currency: string;
  price: number | null; change: number | null; changePct: number | null;
  prevClose: number | null; open: number | null; high: number | null; low: number | null;
  volume: number | null; marketCap: number | null;
  asOf: string | null;          // ISO date/time of last data point
  note?: string;                // labeling badge (futures / proxy / delayed / ADR)
  freq: string;
  unavailable?: string;
  spark?: number[];             // small 7d sparkline series
}

export interface ChartPoint { time: number; open?: number; high?: number; low?: number; close: number; volume?: number }
export interface ChartData { type: "candles" | "line"; points: ChartPoint[]; unavailableReason?: string }

// ---------- Quotes ----------

async function yahooUQuote(a: Asset): Promise<UQuote> {
  const { quote, candles } = await getChart(a.symbol, "5d", "1d");
  return base(a, {
    price: quote.price, change: quote.change, changePct: quote.changePct,
    prevClose: quote.prevClose, open: quote.open, high: quote.dayHigh, low: quote.dayLow,
    volume: quote.volume, marketCap: null,
    asOf: quote.time ? new Date(quote.time * 1000).toISOString() : null,
    spark: candles.map((c) => c.close),
  });
}

async function bondUQuote(a: Asset): Promise<UQuote> {
  if (a.unavailable) return base(a, { unavailable: a.unavailable });
  const series = a.source === "mof" ? await jgbSeries(a.symbol) : await fredSeries(a.symbol);
  const last = series.at(-1), prev = series.at(-2);
  const change = last && prev ? +(last.value - prev.value).toFixed(3) : null;
  return base(a, {
    price: last?.value ?? null,
    change,
    changePct: null, // yields move in points/bp, % change is misleading
    prevClose: prev?.value ?? null,
    asOf: last?.date ?? null,
    spark: series.slice(-30).map((p) => p.value),
  });
}

function base(a: Asset, partial: Partial<UQuote>): UQuote {
  return {
    id: a.id, name: a.name, cls: a.cls, country: a.country, currency: a.currency,
    price: null, change: null, changePct: null, prevClose: null, open: null,
    high: null, low: null, volume: null, marketCap: null, asOf: null,
    note: a.note, freq: a.freq, ...partial,
  };
}

export async function quotesFor(assets: Asset[]): Promise<UQuote[]> {
  // crypto is served from one batched CoinGecko call
  const cryptoAssets = assets.filter((a) => a.cls === "crypto");
  const rest = assets.filter((a) => a.cls !== "crypto");

  const cryptoQuotes: UQuote[] = [];
  if (cryptoAssets.length) {
    const mkts = await coinMarkets();
    for (const a of cryptoAssets) {
      const m = mkts.find((x) => x.id === a.symbol);
      cryptoQuotes.push(base(a, m ? {
        price: m.current_price, change: m.price_change_24h, changePct: m.price_change_percentage_24h,
        high: m.high_24h, low: m.low_24h, volume: m.total_volume, marketCap: m.market_cap,
        asOf: new Date().toISOString(), spark: m.sparkline_in_7d?.price?.filter((_, i) => i % 6 === 0),
      } : { unavailable: "CoinGecko returned no data for this coin" }));
    }
  }

  const restQuotes = await Promise.all(rest.map(async (a) => {
    try {
      if (a.cls === "bond") return await bondUQuote(a);
      return await yahooUQuote(a);
    } catch (e: any) {
      return base(a, { unavailable: `Upstream error: ${e?.message ?? "unknown"}` });
    }
  }));

  // preserve input order
  const all = [...restQuotes, ...cryptoQuotes];
  return assets.map((a) => all.find((q) => q.id === a.id)!);
}

// ---------- Charts ----------

const YAHOO_RANGES: Record<string, [string, string]> = {
  "1D": ["1d", "5m"], "1W": ["5d", "15m"], "1M": ["1mo", "1d"],
  "3M": ["3mo", "1d"], "1Y": ["1y", "1d"], "5Y": ["5y", "1wk"], "ALL": ["max", "1mo"],
};
const CG_DAYS: Record<string, string> = { "1D": "1", "1W": "7", "1M": "30", "3M": "90", "1Y": "365", "5Y": "max", "ALL": "max" };

export async function chartFor(id: string, range: string): Promise<ChartData> {
  const a = byId(id);
  if (!a) return { type: "line", points: [], unavailableReason: "Unknown asset" };
  if (a.unavailable) return { type: "line", points: [], unavailableReason: a.unavailable };

  if (a.cls === "crypto") {
    const days = CG_DAYS[range] ?? "30";
    if (days === "max") { // OHLC caps at 180d granularity issues; use line for max
      const j = await coinChart(a.symbol, "max");
      return { type: "line", points: j.prices.map(([t, p]) => ({ time: Math.floor(t / 1000), close: p })) };
    }
    const ohlc = await coinOhlc(a.symbol, days);
    return { type: "candles", points: ohlc.map(([t, o, h, l, c]) => ({ time: Math.floor(t / 1000), open: o, high: h, low: l, close: c })) };
  }

  if (a.cls === "bond") {
    const series = a.source === "mof" ? await jgbSeries(a.symbol) : await fredSeries(a.symbol);
    const cut = cutoff(range);
    return {
      type: "line",
      points: series
        .filter((p) => new Date(p.date).getTime() >= cut)
        .map((p) => ({ time: Math.floor(new Date(p.date).getTime() / 1000), close: p.value })),
    };
  }

  const [r, i] = YAHOO_RANGES[range] ?? YAHOO_RANGES["1M"];
  const { candles } = await getChart(a.symbol, r, i);
  return { type: "candles", points: candles };
}

function cutoff(range: string): number {
  const d = 24 * 3600 * 1000, now = Date.now();
  switch (range) {
    case "1D": case "1W": return now - 7 * d;
    case "1M": return now - 31 * d;
    case "3M": return now - 92 * d;
    case "1Y": return now - 366 * d;
    case "5Y": return now - 5 * 366 * d;
    default: return 0;
  }
}

// ---------- Fundamentals & news ----------

export async function fundamentalsFor(id: string): Promise<Fundamentals | null> {
  const a = byId(id);
  if (!a || (a.cls !== "stock" && a.cls !== "index" && a.cls !== "commodity")) return null;
  return getFundamentals(a.symbol);
}

export async function newsFor(id: string): Promise<NewsItem[]> {
  const a = byId(id);
  if (!a) return [];
  if (a.cls === "crypto") {
    const all = await cryptoNews();
    const kw = [a.name.toLowerCase(), a.id.toLowerCase()];
    const matched = all.filter((n) => kw.some((k) => n.title.toLowerCase().includes(k)));
    return matched.length ? matched : all.slice(0, 8);
  }
  if (a.cls === "bond") return macroNews();
  return tickerNews(a.symbol, a.id.toUpperCase());
}

