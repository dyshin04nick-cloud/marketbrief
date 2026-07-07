"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PriceChart from "@/components/PriceChart";
import NewsList from "@/components/NewsList";
import WatchStar from "@/components/WatchStar";
import { fmtPrice, fmtBig, fmtChange } from "@/lib/format";
import type { UQuote } from "@/lib/service";
import type { Fundamentals } from "@/lib/yahoo";
import type { Asset } from "@/config/universe";

interface Detail { asset: Asset; quote: UQuote | null; fundamentals: Fundamentals | null; news: unknown[] }

function Stat({ k, v, fallback }: { k: string; v: string | null; fallback?: string }) {
  return (
    <div className="border-b border-line px-4 py-2.5 [&:nth-child(odd)]:border-r">
      <div className="text-[10.5px] uppercase tracking-wide text-dim">{k}</div>
      <div className="mt-0.5 text-[13.5px] font-semibold">
        {v ?? <span className="text-dim italic text-xs" title={fallback}>n/a — {fallback ?? "not provided by free source"}</span>}
      </div>
    </div>
  );
}

export default function AssetPage() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Detail | null>(null);

  useEffect(() => {
    let stop = false;
    const load = () => fetch(`/api/asset/${id}`).then((r) => r.json()).then((j) => !stop && setD(j)).catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => { stop = true; clearInterval(t); };
  }, [id]);

  if (!d) return <div className="p-10 text-center text-dim animate-pulse">Loading asset…</div>;
  if (!d.asset) return <div className="p-10 text-center text-dim">Asset not found in curated universe.</div>;

  const { asset: a, quote: q, fundamentals: f } = d;
  const c = q ? fmtChange(q) : { text: "—", up: null as boolean | null };
  const isYield = a.currency === "%";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-4">
        <div>
          <h1 className="text-xl font-bold">
            {a.name}
            <span className="ml-2 text-sm font-medium text-dim">{a.cls === "crypto" ? a.id.toUpperCase() : a.symbol}</span>
            <span className="ml-2 align-middle"><WatchStar id={a.id} /></span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span className="badge">{a.cls}</span><span className="badge">{a.country}</span>
            {a.note && <span className="badge text-amber-400">{a.note}</span>}
            {a.freq === "monthly" && <span className="badge text-amber-400">monthly · delayed</span>}
            {q?.asOf && <span>as of {new Date(q.asOf).toLocaleString()}</span>}
          </div>
        </div>
        {q && !q.unavailable && (
          <div className="num ml-auto text-right">
            <div className="text-[26px] font-bold leading-tight">{fmtPrice(q.price, a.currency)}</div>
            <div className={`text-sm font-semibold ${c.up == null ? "text-muted" : c.up ? "text-up" : "text-down"}`}>
              {c.up != null && (c.up ? "▲ " : "▼ ")}{c.text}{!isYield && q.change != null && ` (${q.change >= 0 ? "+" : ""}${q.change.toFixed(2)})`}
            </div>
          </div>
        )}
      </div>

      {q?.unavailable ? (
        <div className="panel p-6">
          <h3 className="mb-2 font-bold text-amber-400">Data not available in the free stack</h3>
          <p className="text-sm text-muted">{q.unavailable}</p>
        </div>
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[1fr_340px]">
          <PriceChart assetId={a.id} defaultRange={a.cls === "bond" ? "1Y" : "1M"} />
          <div className="space-y-4">
            <div className="panel">
              <div className="panel-h"><h3 className="text-[13px] font-bold">Key Statistics</h3></div>
              <div className="num grid grid-cols-2">
                {isYield ? (
                  <>
                    <Stat k="Latest Yield" v={q?.price != null ? q.price.toFixed(3) + "%" : null} />
                    <Stat k="Previous" v={q?.prevClose != null ? q.prevClose.toFixed(3) + "%" : null} />
                    <Stat k="Change" v={c.text} />
                    <Stat k="Frequency" v={a.freq} />
                  </>
                ) : (
                  <>
                    <Stat k="Open" v={q?.open != null ? fmtPrice(q.open, a.currency) : null} fallback="not in feed for this asset" />
                    <Stat k="Prev Close" v={q?.prevClose != null ? fmtPrice(q.prevClose, a.currency) : null} />
                    <Stat k="Day High" v={q?.high != null ? fmtPrice(q.high, a.currency) : null} />
                    <Stat k="Day Low" v={q?.low != null ? fmtPrice(q.low, a.currency) : null} />
                    <Stat k="Volume" v={q?.volume != null ? fmtBig(q.volume) : null} fallback="no volume for this instrument" />
                    <Stat k="Market Cap" v={q?.marketCap != null ? "$" + fmtBig(q.marketCap) : f?.marketCap != null ? "$" + fmtBig(f.marketCap) : null} fallback={a.cls === "stock" ? "fundamentals feed degraded" : "n/a for this asset class"} />
                    {a.cls === "stock" && (
                      <>
                        <Stat k="P/E (TTM)" v={f?.trailingPE != null ? f.trailingPE.toFixed(1) : null} fallback={f?.reason ?? "not provided"} />
                        <Stat k="EPS (TTM)" v={f?.eps != null ? String(f.eps) : null} fallback={f?.reason ?? "not provided"} />
                        <Stat k="Div Yield" v={f?.dividendYield != null ? (f.dividendYield * 100).toFixed(2) + "%" : null} fallback="no dividend or feed n/a" />
                        <Stat k="Beta" v={f?.beta != null ? f.beta.toFixed(2) : null} fallback={f?.reason ?? "not provided"} />
                        <Stat k="52W Range" v={f?.fiftyTwoWeekLow != null && f?.fiftyTwoWeekHigh != null ? `${fmtPrice(f.fiftyTwoWeekLow, a.currency)} – ${fmtPrice(f.fiftyTwoWeekHigh, a.currency)}` : null} fallback={f?.reason ?? "not provided"} />
                        <Stat k="Sector" v={f?.sector ?? null} fallback={f?.reason ?? "not provided"} />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="panel">
              <div className="panel-h"><h3 className="text-[13px] font-bold">Related News</h3></div>
              <div className="max-h-[420px] overflow-y-auto"><NewsList url={`/api/asset/${a.id}/news`} limit={10} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

