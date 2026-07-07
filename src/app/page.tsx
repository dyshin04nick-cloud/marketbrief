"use client";
import { useState } from "react";
import QuoteTable from "@/components/QuoteTable";
import NewsList from "@/components/NewsList";

const STOCK_TABS = [
  { key: "us", label: "🇺🇸 United States" },
  { key: "kr", label: "🇰🇷 South Korea" },
  { key: "jp", label: "🇯🇵 Japan" },
  { key: "cn", label: "🇨🇳 China" },
];

export default function Overview() {
  const [tab, setTab] = useState("us");
  return (
    <div className="space-y-4">
      <div className="panel">
        <div className="panel-h"><h3 className="text-[13px] font-bold">Indices — US · KR · JP · CN/HK</h3>
          <span className="text-[11px] text-dim">auto-refresh 60s</span></div>
        <QuoteTable group="indices" showCap={false} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <div className="panel-h">
            <div className="flex gap-1.5">
              {STOCK_TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`chip ${tab === t.key ? "chip-active" : ""}`}>{t.label}</button>
              ))}
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto"><QuoteTable group={tab} /></div>
        </div>

        <div className="space-y-4">
          <div className="panel">
            <div className="panel-h"><h3 className="text-[13px] font-bold">Crypto — Top 10</h3></div>
            <div className="max-h-[300px] overflow-y-auto"><QuoteTable group="crypto" /></div>
          </div>
          <div className="panel">
            <div className="panel-h"><h3 className="text-[13px] font-bold">Gold & Silver <span className="badge ml-1">COMEX futures</span></h3></div>
            <QuoteTable group="commodities" showCap={false} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel">
          <div className="panel-h"><h3 className="text-[13px] font-bold">Government Bond Yields — US · JP · KR · CN</h3>
            <span className="text-[11px] text-dim">US: FRED daily · JP: MOF daily · KR: OECD monthly</span></div>
          <QuoteTable group="bonds" showCap={false} refreshSec={600} />
        </div>
        <div className="panel">
          <div className="panel-h"><h3 className="text-[13px] font-bold">Market News — majors only</h3>
            <span className="text-[11px] text-dim">whitelisted sources, deduped</span></div>
          <div className="max-h-[560px] overflow-y-auto"><NewsList url="/api/news?scope=all" limit={14} /></div>
        </div>
      </div>
    </div>
  );
}

