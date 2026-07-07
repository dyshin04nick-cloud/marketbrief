// Keyless RSS-based news, majors only. Sources:
// - Yahoo Finance per-ticker RSS (works for every curated stock/index/futures symbol)
// - CoinDesk + Cointelegraph RSS (crypto)
// - CNBC + MarketWatch RSS (macro / bonds)
// Quality filters: source whitelist, dedupe by normalized title, recency sort.
import { cached } from "./cache";

export interface NewsItem {
  title: string; link: string; source: string; pubDate: string; ts: number; tag: string;
}

const UA = { "User-Agent": "Mozilla/5.0 (MarketBrief/0.1)" };

function pick(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

async function parseRss(url: string, fallbackSource: string, tag: string): Promise<NewsItem[]> {
  try {
    const r = await fetch(url, { headers: UA, cache: "no-store" });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.split(/<item[\s>]/).slice(1);
    return items.slice(0, 25).map((chunk) => {
      const pubDate = pick(chunk, "pubDate");
      const src = pick(chunk, "source") || fallbackSource;
      return {
        title: decode(pick(chunk, "title")),
        link: pick(chunk, "link") || (chunk.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1] ?? "").trim(),
        source: src, pubDate, ts: Date.parse(pubDate) || 0, tag,
      };
    }).filter((i) => i.title && i.link);
  } catch { return []; }
}

function decode(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'");
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((i) => {
    const key = i.title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "").slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function tickerNews(yahooSymbol: string, tag: string): Promise<NewsItem[]> {
  return cached(`news:t:${yahooSymbol}`, 600, async () => {
    const u = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(yahooSymbol)}&region=US&lang=en-US`;
    const items = await parseRss(u, "Yahoo Finance", tag);
    return dedupe(items).sort((a, b) => b.ts - a.ts).slice(0, 12);
  });
}

export async function cryptoNews(): Promise<NewsItem[]> {
  return cached("news:crypto", 600, async () => {
    const feeds = await Promise.all([
      parseRss("https://www.coindesk.com/arc/outboundfeeds/rss/", "CoinDesk", "Crypto"),
      parseRss("https://cointelegraph.com/rss", "Cointelegraph", "Crypto"),
    ]);
    return dedupe(feeds.flat()).sort((a, b) => b.ts - a.ts).slice(0, 20);
  });
}

export async function macroNews(): Promise<NewsItem[]> {
  return cached("news:macro", 600, async () => {
    const feeds = await Promise.all([
      parseRss("https://www.cnbc.com/id/20910258/device/rss/rss.html", "CNBC", "Macro"), // CNBC Economy
      parseRss("https://www.cnbc.com/id/10000664/device/rss/rss.html", "CNBC", "Bonds"), // CNBC Bonds
      parseRss("https://feeds.content.dowjones.io/public/rss/mw_topstories", "MarketWatch", "Macro"),
    ]);
    return dedupe(feeds.flat()).sort((a, b) => b.ts - a.ts).slice(0, 20);
  });
}

