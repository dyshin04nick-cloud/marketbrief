// FRED keyless CSV endpoint (fredgraph.csv). Daily US Treasury yields,
// monthly OECD series for Korea. No API key required.
import { cached } from "./cache";

export interface SeriesPoint { date: string; value: number }

export async function fredSeries(seriesId: string): Promise<SeriesPoint[]> {
  return cached(`fred:${seriesId}`, 3600, async () => {
    const u = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${encodeURIComponent(seriesId)}`;
    const r = await fetch(u, { headers: { "User-Agent": "MarketBrief/0.1" }, cache: "no-store" });
    if (!r.ok) throw new Error(`fred ${r.status} for ${seriesId}`);
    const text = await r.text();
    const lines = text.trim().split("\n").slice(1);
    const out: SeriesPoint[] = [];
    for (const line of lines) {
      const [date, v] = line.split(",");
      const value = parseFloat(v);
      if (!isNaN(value)) out.push({ date, value });
    }
    return out;
  });
}

