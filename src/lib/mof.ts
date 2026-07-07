// Japan Ministry of Finance official JGB yield CSVs (daily, actual data, free).
// Verified 2026-07-07:
//   current month:  .../interest_rate/jgbcme.csv
//   full history:   .../interest_rate/historical/jgbcme_all.csv (1974–, ~1.1 MB)
// Format: "Date,1Y,2Y,3Y,4Y,5Y,6Y,7Y,8Y,9Y,10Y,15Y,20Y,25Y,30Y,40Y"
// Dates are western (2026/7/1); missing values are "-".
import { cached } from "./cache";
import type { SeriesPoint } from "./fred";

const BASE = "https://www.mof.go.jp/english/policy/jgbs/reference/interest_rate";
const MATURITIES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "15", "20", "25", "30", "40"];

function parseDate(s: string): string | null {
  const m = s.trim().match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null;
}

async function fetchCsv(url: string): Promise<Map<string, Record<string, number>>> {
  const r = await fetch(url, { headers: { "User-Agent": "MarketBrief/0.1" }, cache: "no-store" });
  if (!r.ok) throw new Error(`mof ${r.status} for ${url}`);
  const text = new TextDecoder("shift-jis").decode(await r.arrayBuffer());
  const out = new Map<string, Record<string, number>>();
  for (const line of text.split("\n")) {
    const cells = line.split(",");
    const date = parseDate(cells[0] ?? "");
    if (!date) continue;
    const values: Record<string, number> = {};
    MATURITIES.forEach((mat, i) => {
      const v = parseFloat(cells[i + 1]);
      if (!isNaN(v)) values[mat] = v;
    });
    out.set(date, values);
  }
  return out;
}

export async function jgbSeries(maturity: string): Promise<SeriesPoint[]> {
  const rows = await cached("mof:jgb", 3600, async () => {
    // full history + current month (history file lags by ~1 month)
    const [hist, cur] = await Promise.all([
      fetchCsv(`${BASE}/historical/jgbcme_all.csv`).catch(() => new Map<string, Record<string, number>>()),
      fetchCsv(`${BASE}/jgbcme.csv`),
    ]);
    cur.forEach((v, d) => hist.set(d, v));
    return Array.from(hist.entries()).sort((a, b) => (a[0] < b[0] ? -1 : 1));
  });
  return rows
    .filter(([, v]) => v[maturity] != null)
    .map(([date, v]) => ({ date, value: v[maturity] }));
}

