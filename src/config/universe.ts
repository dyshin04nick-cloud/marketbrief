// MarketBrief curated asset universe (v2, approved 2026-07-07)
// Depth-over-breadth: every listed asset must render full quote + chart + stats + news,
// or an explicitly labeled fallback. Never silently omit data.

export type AssetClass = "index" | "stock" | "crypto" | "bond" | "commodity";
export type Country = "US" | "KR" | "JP" | "CN" | "HK" | "GLOBAL";
export type Source = "yahoo" | "coingecko" | "fred" | "mof" | "none";
export type Freq = "realtime" | "daily" | "monthly";

export interface Asset {
  id: string;       // url-safe unique id
  symbol: string;   // provider symbol (Yahoo ticker / CoinGecko id / FRED series id / MOF maturity)
  name: string;
  cls: AssetClass;
  country: Country;
  currency: string;
  source: Source;
  freq: Freq;
  note?: string;      // shown as a badge: proxy / futures / delayed etc.
  unavailable?: string; // if set, render an explicit "unavailable" card with this reason
}

export const INDICES: Asset[] = [
  { id: "sp500", symbol: "^GSPC", name: "S&P 500", cls: "index", country: "US", currency: "USD", source: "yahoo", freq: "realtime" },
  { id: "nasdaq", symbol: "^IXIC", name: "NASDAQ Composite", cls: "index", country: "US", currency: "USD", source: "yahoo", freq: "realtime" },
  { id: "dow", symbol: "^DJI", name: "Dow Jones Industrial Average", cls: "index", country: "US", currency: "USD", source: "yahoo", freq: "realtime" },
  { id: "kospi", symbol: "^KS11", name: "KOSPI", cls: "index", country: "KR", currency: "KRW", source: "yahoo", freq: "realtime" },
  { id: "kosdaq", symbol: "^KQ11", name: "KOSDAQ", cls: "index", country: "KR", currency: "KRW", source: "yahoo", freq: "realtime" },
  { id: "nikkei", symbol: "^N225", name: "Nikkei 225", cls: "index", country: "JP", currency: "JPY", source: "yahoo", freq: "realtime" },
  { id: "topix", symbol: "1306.T", name: "TOPIX", cls: "index", country: "JP", currency: "JPY", source: "yahoo", freq: "realtime", note: "ETF proxy (NEXT FUNDS TOPIX ETF) — Yahoo has no direct TOPIX feed" },
  { id: "shanghai", symbol: "000001.SS", name: "Shanghai Composite", cls: "index", country: "CN", currency: "CNY", source: "yahoo", freq: "realtime" },
  { id: "shenzhen", symbol: "399001.SZ", name: "Shenzhen Component", cls: "index", country: "CN", currency: "CNY", source: "yahoo", freq: "realtime" },
  { id: "hangseng", symbol: "^HSI", name: "Hang Seng Index", cls: "index", country: "HK", currency: "HKD", source: "yahoo", freq: "realtime" },
  { id: "vix", symbol: "^VIX", name: "CBOE Volatility Index (VIX)", cls: "index", country: "US", currency: "USD", source: "yahoo", freq: "realtime" },
];

const us = (id: string, symbol: string, name: string): Asset =>
  ({ id, symbol, name, cls: "stock", country: "US", currency: "USD", source: "yahoo", freq: "realtime" });
const kr = (id: string, symbol: string, name: string): Asset =>
  ({ id, symbol, name, cls: "stock", country: "KR", currency: "KRW", source: "yahoo", freq: "realtime" });
const jp = (id: string, symbol: string, name: string): Asset =>
  ({ id, symbol, name, cls: "stock", country: "JP", currency: "JPY", source: "yahoo", freq: "realtime" });
const cn = (id: string, symbol: string, name: string, currency = "HKD", note?: string): Asset =>
  ({ id, symbol, name, cls: "stock", country: "CN", currency, source: "yahoo", freq: "realtime", note });

export const STOCKS: Asset[] = [
  // --- United States (20) ---
  us("aapl", "AAPL", "Apple"), us("msft", "MSFT", "Microsoft"), us("nvda", "NVDA", "NVIDIA"),
  us("googl", "GOOGL", "Alphabet"), us("amzn", "AMZN", "Amazon"), us("meta", "META", "Meta Platforms"),
  us("tsla", "TSLA", "Tesla"), us("avgo", "AVGO", "Broadcom"), us("brkb", "BRK-B", "Berkshire Hathaway"),
  us("jpm", "JPM", "JPMorgan Chase"), us("lly", "LLY", "Eli Lilly"), us("v", "V", "Visa"),
  us("ma", "MA", "Mastercard"), us("unh", "UNH", "UnitedHealth"), us("xom", "XOM", "Exxon Mobil"),
  us("cost", "COST", "Costco"), us("hd", "HD", "Home Depot"), us("pg", "PG", "Procter & Gamble"),
  us("nflx", "NFLX", "Netflix"), us("amd", "AMD", "AMD"),
  // --- South Korea (20) ---
  kr("samsung", "005930.KS", "Samsung Electronics"), kr("skhynix", "000660.KS", "SK hynix"),
  kr("lgensol", "373220.KS", "LG Energy Solution"), kr("samsungbio", "207940.KS", "Samsung Biologics"),
  kr("hyundai", "005380.KS", "Hyundai Motor"), kr("kia", "000270.KS", "Kia"),
  kr("celltrion", "068270.KS", "Celltrion"), kr("posco", "005490.KS", "POSCO Holdings"),
  kr("naver", "035420.KS", "NAVER"), kr("kakao", "035720.KS", "Kakao"),
  kr("lgchem", "051910.KS", "LG Chem"), kr("samsungsdi", "006400.KS", "Samsung SDI"),
  kr("kbfg", "105560.KS", "KB Financial Group"), kr("shinhan", "055550.KS", "Shinhan Financial Group"),
  kr("mobis", "012330.KS", "Hyundai Mobis"), kr("samsungcnt", "028260.KS", "Samsung C&T"),
  kr("lgelec", "066570.KS", "LG Electronics"), kr("samsunglife", "032830.KS", "Samsung Life"),
  kr("poscofuturem", "003670.KS", "POSCO Future M"), kr("skinc", "034730.KS", "SK Inc."),
  // --- Japan (20) ---
  jp("toyota", "7203.T", "Toyota Motor"), jp("sony", "6758.T", "Sony Group"),
  jp("softbank", "9984.T", "SoftBank Group"), jp("mufg", "8306.T", "Mitsubishi UFJ Financial"),
  jp("keyence", "6861.T", "Keyence"), jp("tokyoelectron", "8035.T", "Tokyo Electron"),
  jp("fastretail", "9983.T", "Fast Retailing"), jp("hitachi", "6501.T", "Hitachi"),
  jp("mitsubishicorp", "8058.T", "Mitsubishi Corporation"), jp("ntt", "9432.T", "NTT"),
  jp("shinetsu", "4063.T", "Shin-Etsu Chemical"), jp("recruit", "6098.T", "Recruit Holdings"),
  jp("mitsui", "8031.T", "Mitsui & Co."), jp("nintendo", "7974.T", "Nintendo"),
  jp("denso", "6902.T", "Denso"), jp("chugai", "4519.T", "Chugai Pharmaceutical"),
  jp("daikin", "6367.T", "Daikin Industries"), jp("kddi", "9433.T", "KDDI"),
  jp("tokiomarine", "8766.T", "Tokio Marine"), jp("honda", "7267.T", "Honda Motor"),
  // --- China (20; HK listings + US ADRs, labeled) ---
  cn("tencent", "0700.HK", "Tencent"), cn("baba", "BABA", "Alibaba", "USD", "US ADR"),
  cn("byd", "1211.HK", "BYD"), cn("meituan", "3690.HK", "Meituan"),
  cn("pdd", "PDD", "PDD Holdings", "USD", "US ADR"), cn("jd", "JD", "JD.com", "USD", "US ADR"),
  cn("netease", "NTES", "NetEase", "USD", "US ADR"), cn("baidu", "BIDU", "Baidu", "USD", "US ADR"),
  cn("chinamobile", "0941.HK", "China Mobile"), cn("icbc", "1398.HK", "ICBC"),
  cn("ccb", "0939.HK", "China Construction Bank"), cn("pingan", "2318.HK", "Ping An Insurance"),
  cn("cnooc", "0883.HK", "CNOOC"), cn("petrochina", "0857.HK", "PetroChina"),
  cn("xiaomi", "1810.HK", "Xiaomi"), cn("hkex", "0388.HK", "Hong Kong Exchanges"),
  cn("kuaishou", "1024.HK", "Kuaishou"), cn("trip", "TCOM", "Trip.com", "USD", "US ADR"),
  cn("liauto", "LI", "Li Auto", "USD", "US ADR"), cn("nio", "NIO", "NIO", "USD", "US ADR"),
];

export const CRYPTO: Asset[] = [
  { id: "btc", symbol: "bitcoin", name: "Bitcoin", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "eth", symbol: "ethereum", name: "Ethereum", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "bnb", symbol: "binancecoin", name: "BNB", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "sol", symbol: "solana", name: "Solana", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "xrp", symbol: "ripple", name: "XRP", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "doge", symbol: "dogecoin", name: "Dogecoin", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "ada", symbol: "cardano", name: "Cardano", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "avax", symbol: "avalanche-2", name: "Avalanche", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "link", symbol: "chainlink", name: "Chainlink", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
  { id: "trx", symbol: "tron", name: "TRON", cls: "crypto", country: "GLOBAL", currency: "USD", source: "coingecko", freq: "realtime" },
];

// ~3 government-bond benchmarks per priority country.
// "actual" = real yield data. Anything else is explicitly labeled.
export const BONDS: Asset[] = [
  // US — daily, actual (FRED). The US Treasury issues no 50Y bond; 10Y shown as the third benchmark.
  { id: "us10y", symbol: "DGS10", name: "US Treasury 10Y Yield", cls: "bond", country: "US", currency: "%", source: "fred", freq: "daily", note: "Shown in place of 50Y — the US issues no 50Y Treasury" },
  { id: "us20y", symbol: "DGS20", name: "US Treasury 20Y Yield", cls: "bond", country: "US", currency: "%", source: "fred", freq: "daily" },
  { id: "us30y", symbol: "DGS30", name: "US Treasury 30Y Yield", cls: "bond", country: "US", currency: "%", source: "fred", freq: "daily" },
  // Japan — daily, actual (Ministry of Finance official JGB CSV)
  { id: "jp10y", symbol: "10", name: "Japan Govt Bond 10Y Yield", cls: "bond", country: "JP", currency: "%", source: "mof", freq: "daily" },
  { id: "jp20y", symbol: "20", name: "Japan Govt Bond 20Y Yield", cls: "bond", country: "JP", currency: "%", source: "mof", freq: "daily" },
  { id: "jp30y", symbol: "30", name: "Japan Govt Bond 30Y Yield", cls: "bond", country: "JP", currency: "%", source: "mof", freq: "daily" },
  // Korea — only 10Y available free (OECD series via FRED, monthly)
  { id: "kr10y", symbol: "IRLTLT01KRM156N", name: "Korea Govt Bond 10Y Yield", cls: "bond", country: "KR", currency: "%", source: "fred", freq: "monthly", note: "OECD monthly series — delayed" },
  { id: "kr20y", symbol: "", name: "Korea Govt Bond 20Y Yield", cls: "bond", country: "KR", currency: "%", source: "none", freq: "daily", unavailable: "No free API provides daily KRTB 20Y. Closest free benchmark: Korea 10Y (monthly). Paid option: KOFIA/KIS data feeds." },
  { id: "kr30y", symbol: "", name: "Korea Govt Bond 30Y Yield", cls: "bond", country: "KR", currency: "%", source: "none", freq: "daily", unavailable: "No free API provides daily KRTB 30Y. Closest free benchmark: Korea 10Y (monthly)." },
  // China — no reliable free yield API; explicit gap
  { id: "cn10y", symbol: "", name: "China Govt Bond 10Y Yield", cls: "bond", country: "CN", currency: "%", source: "none", freq: "daily", unavailable: "ChinaBond does not offer a free public API. No reliable free source for CGB yields; shown as an explicit gap rather than unverified proxy data." },
  { id: "cn20y", symbol: "", name: "China Govt Bond 20Y Yield", cls: "bond", country: "CN", currency: "%", source: "none", freq: "daily", unavailable: "See China 10Y — same free-data gap." },
  { id: "cn30y", symbol: "", name: "China Govt Bond 30Y Yield", cls: "bond", country: "CN", currency: "%", source: "none", freq: "daily", unavailable: "See China 10Y — same free-data gap." },
];

export const COMMODITIES: Asset[] = [
  { id: "gold", symbol: "GC=F", name: "Gold", cls: "commodity", country: "GLOBAL", currency: "USD", source: "yahoo", freq: "realtime", note: "COMEX front-month futures — not spot" },
  { id: "silver", symbol: "SI=F", name: "Silver", cls: "commodity", country: "GLOBAL", currency: "USD", source: "yahoo", freq: "realtime", note: "COMEX front-month futures — not spot" },
];

export const ALL_ASSETS: Asset[] = [...INDICES, ...STOCKS, ...CRYPTO, ...BONDS, ...COMMODITIES];
export const byId = (id: string) => ALL_ASSETS.find((a) => a.id === id);

// News: majors only — indices, all curated stocks, crypto top 10, bond/macro topics.
export const NEWS_SOURCES_WHITELIST = [
  "reuters", "cnbc", "bloomberg", "wsj", "financial times", "coindesk", "cointelegraph",
  "marketwatch", "yahoo", "investing.com", "barron", "nikkei", "yonhap", "scmp", "ap ",
];

