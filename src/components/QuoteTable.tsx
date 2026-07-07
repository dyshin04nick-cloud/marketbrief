"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UQuote } from "@/lib/service";
import { fmtPrice, fmtBig, fmtChange, timeAgo } from "@/lib/format";
import Sparkline from "./Sparkline";
import WatchStar from "./WatchStar";

export default function QuoteTable({ group, ids, refreshSec = 60, showCap = true }: {
  group?: string; ids?: string[]; refreshSec?: number; showCap?: boolean;
}) {
  const [quotes, setQuotes] = useState<UQuote[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const url = ids ? `/api/quotes?ids=${ids.join(",")}` : `/api/quotes?group=${group}`;

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch(url).then((r) => r.json())
        .then((j) => { if (!stop) { setQuotes(j.quotes ?? []); if (j.error) setErr(j.error); } })
        .catch((e) => !stop && setErr(String(e)));
    load();
    const t = setInterval(load, refreshSec * 1000);
    return () => { stop = true; clearInterval(t); };
  }, [url, refreshSec]);

  if (!quotes) return <div className="p-6 text-center text-sm text-dim animate-pulse">Loading market data…</div>;
  if (err && quotes.length === 0) return <div className="p-6 text-center text-sm text-down">Data source error: {err}</div>;

  return (
    <table className="num w-full text-[13px]">
      <thead>
        <tr className="text-[10.5px] uppercase tracking-wider text-dim">
          <th className="w-8 px-3 py-2"></th>
          <th className="px-3 py-2 text-left font-semibold">Name</th>
          <th className="px-3 py-2 text-right font-semibold">Price</th>
          <th className="px-3 py-2 text-right font-semibold">Change</th>
          {showCap && <th className="hidden px-3 py-2 text-right font-semibold md:table-cell">Mkt Cap / Vol</th>}
          <th className="hidden px-3 py-2 text-right font-semibold lg:table-cell">Trend</th>
        </tr>
      </thead>
      <tbody>
        {quotes.map((q) => {
          const c = fmtChange(q);
          return (
            <tr key={q.id} className="border-t border-line hover:bg-hover2">
              <td className="px-3 py-2"><WatchStar id={q.id} /></td>
              <td className="px-3 py-2">
                <Link href={`/asset/${q.id}`} className="block">
                  <span className="font-semibold">{q.name}</span>
                  <span className="ml-2 text-[10px] text-dim">{q.country}</span>
                  {q.note && <span className="badge ml-2">{q.note.split("—")[0].trim()}</span>}
                  {q.freq === "monthly" && <span className="badge ml-1 text-amber-400">monthly · delayed</span>}
                </Link>
              </td>
              {q.unavailable ? (
                <td colSpan={showCap ? 4 : 3} className="px-3 py-2 text-right text-xs text-dim italic" title={q.unavailable}>
                  Not available in free data stack — {q.unavailable.split(".")[0]}.
                </td>
              ) : (
                <>
                  <td className="px-3 py-2 text-right font-semibold">{fmtPrice(q.price, q.currency)}</td>
                  <td className={`px-3 py-2 text-right font-semibold ${c.up == null ? "text-muted" : c.up ? "text-up" : "text-down"}`}>{c.text}</td>
                  {showCap && (
                    <td className="hidden px-3 py-2 text-right text-muted md:table-cell">
                      {q.marketCap != null ? "$" + fmtBig(q.marketCap) : fmtBig(q.volume)}
                    </td>
                  )}
                  <td className="hidden px-3 py-2 lg:table-cell"><div className="flex justify-end"><Sparkline data={q.spark} up={c.up} /></div></td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

