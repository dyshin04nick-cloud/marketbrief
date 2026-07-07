// CoinGecko public API (keyless: ~10-30 calls/min; optional Demo key via
// COINGECKO_API_KEY env raises to 30 calls/min + 10k/mo). Aggressive caching
// means the whole site typically uses < 100 calls/day.
import { cached } from "./cache";
import { CRYPTO } from "@/config/universe";

const BASE = "https://api.coingecko.com/api/v3";

function headers(): Record<string, string> {
  const h: Record<string, string> = { accept: "application/json" };
  if (process.env.COINGECKO_API_KEY) h["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  return h;
}

export interface CoinMarket {
  id: string; symbol: string; name: string; current_price: number;
  market_cap: number; market_cap_rank: number; total_volume: number;
  high_24h: number; low_24h: number; price_change_24h: number;
  price_change_percentage_24h: number; circulating_supply: number;
  total_supply: number | null; ath: number; atl: number;
  sparkline_in_7d?: { price: number[] };
}

export async function coinMarkets(): Promise<CoinMarket[]> {
  return cached("cg:markets", 60, async () => {
    const ids = CRYPTO.map((c) => c.symbol).join(",");
    const u = `${BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h,7d`;
    const r = await fetch(u, { headers: headers(), cache: "no-store" });
    if (!r.ok) throw new Error(`coingecko ${r.status}`);
    return r.json();
  });
}

export async function coinChart(id: string, days: string): Promise<{ prices: [number, number][]; total_volumes: [number, number][] }> {
  const ttl = days === "1" ? 120 : 600;
  return cached(`cg:chart:${id}:${days}`, ttl, async () => {
    const u = `${BASE}/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const r = await fetch(u, { headers: headers(), cache: "no-store" });
    if (!r.ok) throw new Error(`coingecko ${r.status}`);
    return r.json();
  });
}

export async function coinOhlc(id: string, days: string): Promise<[number, number, number, number, number][]> {
  const ttl = days === "1" ? 120 : 600;
  return cached(`cg:ohlc:${id}:${days}`, ttl, async () => {
    const u = `${BASE}/coins/${id}/ohlc?vs_currency=usd&days=${days}`;
    const r = await fetch(u, { headers: headers(), cache: "no-store" });
    if (!r.ok) throw new Error(`coingecko ${r.status}`);
    return r.json();
  });
}

