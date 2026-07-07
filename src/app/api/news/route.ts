import { NextRequest, NextResponse } from "next/server";
import { cryptoNews, macroNews, tickerNews } from "@/lib/news";
import { INDICES, STOCKS } from "@/config/universe";

export const dynamic = "force-dynamic";

// Market-wide news: mix of index tickers, biggest stocks, crypto, macro.
export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "all";
  try {
    if (scope === "crypto") return NextResponse.json({ items: await cryptoNews() });
    if (scope === "macro") return NextResponse.json({ items: await macroNews() });
    if (scope === "stocks") {
      const top = ["AAPL", "NVDA", "MSFT", "TSLA", "005930.KS", "7203.T", "0700.HK", "BABA"];
      const feeds = await Promise.all(top.map((s) => tickerNews(s, s)));
      const items = feeds.flat().sort((a, b) => b.ts - a.ts).slice(0, 30);
      return NextResponse.json({ items });
    }
    // all: blend
    const idx = await Promise.all(INDICES.slice(0, 3).map((i) => tickerNews(i.symbol, i.name)));
    const [c, m] = await Promise.all([cryptoNews(), macroNews()]);
    const stocks = await Promise.all(STOCKS.slice(0, 4).map((s) => tickerNews(s.symbol, s.symbol)));
    const items = [...idx.flat(), ...c.slice(0, 8), ...m.slice(0, 8), ...stocks.flat()]
      .sort((a, b) => b.ts - a.ts).slice(0, 40);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message }, { status: 502 });
  }
}

