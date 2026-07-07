// Yahoo Finance public JSON endpoints (unofficial, keyless).
// v8 chart API serves both quotes (meta) and OHLCV candles and does NOT require
// crumb auth. Fundamentals via v10 quoteSummary need a cookie+crumb handshake;
// we do it lazily and degrade gracefully if it breaks.
import { cached } from "./cache";

const UA = { "User-Agent": "Mozilla/5.0 (MarketBrief/0.1)" };
const BASE = "https://query1.finance.yahoo.com";

export interface Quote {
  symbol: string;
  price: number | null;
  prevClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  volume: number | null;
  currency: string | null;
  marketState: string | null;
  time: number | null; // unix seconds of last trade
  change: number | null;
  changePct: number | null;
}

export interface Candle { time: number; open: number; high: number; low: number; close: number; volume: number }

async function yfetch(url: string): Promise<any> {
  const r = await fetch(url, { headers: UA, cache: "no-store" });
  if (!r.ok) throw new Error(`yahoo ${r.status} for ${url}`);
  return r.json();
}

export async function getChart(symbol: string, range: string, interval: string): Promise<{ quote: Quote; candles: Candle[] }> {
  return cached(`yc:${symbol}:${range}:${interval}`, rangeTtl(range), async () => {
    const u = `${BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false&events=div%2Csplit`;
    const j = await yfetch(u);
    const res = j?.chart?.result?.[0];
    if (!res) throw new Error(`yahoo: no result for ${symbol}`);
    const m = res.meta ?? {};
    const ts: number[] = res.timestamp ?? [];
    const q = res.indicators?.quote?.[0] ?? {};
    const candles: Candle[] = [];
    for (let i = 0; i < ts.length; i++) {
      const o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
      if (o == null || h == null || l == null || c == null) continue;
      candles.push({ time: ts[i], open: o, high: h, low: l, close: c, volume: q.volume?.[i] ?? 0 });
    }
    const price = m.regularMarketPrice ?? candles.at(-1)?.close ?? null;
    const prevClose = m.chartPreviousClose ?? m.previousClose ?? null;
    const change = price != null && prevClose != null ? price - prevClose : null;
    return {
      quote: {
        symbol,
        price,
        prevClose,
        open: candles.at(0)?.open ?? null,
        dayHigh: m.regularMarketDayHigh ?? null,
        dayLow: m.regularMarketDayLow ?? null,
        volume: m.regularMarketVolume ?? null,
        currency: m.currency ?? null,
        marketState: m.marketState ?? null,
        time: m.regularMarketTime ?? null,
        change,
        changePct: change != null && prevClose ? (change / prevClose) * 100 : null,
      },
      candles,
    };
  });
}

// Batch "quote board": 1d/1m chart per symbol is heavy; instead use 5d/1d and take meta.
export async function getQuote(symbol: string): Promise<Quote> {
  const { quote } = await getChart(symbol, "5d", "1d");
  return quote;
}

function rangeTtl(range: string): number {
  if (range === "1d" || range === "5d") return 60;       // intraday: 60s
  if (range === "1mo" || range === "3mo") return 300;     // 5 min
  return 3600;                                            // long history: 1h
}

// ---- Fundamentals via quoteSummary (crumb-authenticated, best-effort) ----
let crumbCache: { cookie: string; crumb: string; ts: number } | null = null;

async function getCrumb(): Promise<{ cookie: string; crumb: string } | null> {
  if (crumbCache && Date.now() - crumbCache.ts < 30 * 60 * 1000) return crumbCache;
  try {
    const r1 = await fetch("https://fc.yahoo.com/", { headers: UA, redirect: "manual" });
    const cookie = r1.headers.get("set-cookie")?.split(";")[0] ?? "";
    if (!cookie) return null;
    const r2 = await fetch(`${BASE}/v1/test/getcrumb`, { headers: { ...UA, Cookie: cookie } });
    const crumb = (await r2.text()).trim();
    if (!crumb || crumb.includes("<")) return null;
    crumbCache = { cookie, crumb, ts: Date.now() };
    return crumbCache;
  } catch { return null; }
}

export interface Fundamentals {
  marketCap: number | null; trailingPE: number | null; forwardPE: number | null;
  eps: number | null; dividendYield: number | null; beta: number | null;
  fiftyTwoWeekLow: number | null; fiftyTwoWeekHigh: number | null;
  avgVolume: number | null; sector: string | null; industry: string | null;
  available: boolean; reason?: string;
}

const NA: Fundamentals = { marketCap: null, trailingPE: null, forwardPE: null, eps: null, dividendYield: null, beta: null, fiftyTwoWeekLow: null, fiftyTwoWeekHigh: null, avgVolume: null, sector: null, industry: null, available: false, reason: "Fundamentals endpoint unavailable (Yahoo crumb auth failed) — quote & chart data unaffected" };

export async function getFundamentals(symbol: string): Promise<Fundamentals> {
  return cached(`yf:${symbol}`, 3600, async () => {
    const auth = await getCrumb();
    if (!auth) return NA;
    const mods = "summaryDetail,defaultKeyStatistics,assetProfile,price";
    const u = `${BASE}/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=${mods}&crumb=${encodeURIComponent(auth.crumb)}`;
    try {
      const r = await fetch(u, { headers: { "User-Agent": UA["User-Agent"], Cookie: auth.cookie }, cache: "no-store" });
      if (!r.ok) return NA;
      const j = await r.json();
      const res = j?.quoteSummary?.result?.[0];
      if (!res) return NA;
      const sd = res.summaryDetail ?? {}, ks = res.defaultKeyStatistics ?? {}, ap = res.assetProfile ?? {}, pr = res.price ?? {};
      const raw = (x: any) => (x && typeof x === "object" ? x.raw ?? null : x ?? null);
      return {
        marketCap: raw(pr.marketCap) ?? raw(sd.marketCap),
        trailingPE: raw(sd.trailingPE), forwardPE: raw(sd.forwardPE) ?? raw(ks.forwardPE),
        eps: raw(ks.trailingEps), dividendYield: raw(sd.dividendYield), beta: raw(sd.beta),
        fiftyTwoWeekLow: raw(sd.fiftyTwoWeekLow), fiftyTwoWeekHigh: raw(sd.fiftyTwoWeekHigh),
        avgVolume: raw(sd.averageVolume), sector: ap.sector ?? null, industry: ap.industry ?? null,
        available: true,
      };
    } catch { return NA; }
  });
}

