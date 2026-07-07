export function fmtPrice(v: number | null | undefined, currency?: string | null): string {
  if (v == null) return "—";
  if (currency === "%") return v.toFixed(3) + "%";
  const digits = v >= 10000 ? 0 : v >= 100 ? 2 : v >= 1 ? 2 : 4;
  const s = v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });
  const sym = currency === "USD" ? "$" : currency === "KRW" ? "₩" : currency === "JPY" ? "¥" : currency === "HKD" ? "HK$" : currency === "CNY" ? "CN¥" : "";
  return sym + s;
}

export function fmtBig(v: number | null | undefined): string {
  if (v == null) return "—";
  if (v >= 1e12) return (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return String(v);
}

export function fmtChange(q: { change: number | null; changePct: number | null; currency: string }): { text: string; up: boolean | null } {
  if (q.currency === "%") {
    if (q.change == null) return { text: "—", up: null };
    const bp = Math.round(q.change * 100);
    return { text: `${bp >= 0 ? "+" : ""}${bp} bp`, up: bp >= 0 };
  }
  if (q.changePct == null) return { text: "—", up: null };
  const sign = q.changePct >= 0 ? "+" : "";
  return { text: `${sign}${q.changePct.toFixed(2)}%`, up: q.changePct >= 0 };
}

export function timeAgo(ts: number): string {
  if (!ts) return "";
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 3600) return Math.max(1, Math.floor(s / 60)) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

