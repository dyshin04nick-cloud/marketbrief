"use client";
import { useState } from "react";
import NewsList from "@/components/NewsList";

const SCOPES = [
  { key: "all", label: "All majors" },
  { key: "stocks", label: "Stocks" },
  { key: "crypto", label: "Crypto" },
  { key: "macro", label: "Bonds & Macro" },
];

export default function NewsPage() {
  const [scope, setScope] = useState("all");
  return (
    <div className="panel">
      <div className="panel-h">
        <div className="flex gap-1.5">
          {SCOPES.map((s) => (
            <button key={s.key} onClick={() => setScope(s.key)}
              className={`chip ${scope === s.key ? "chip-active" : ""}`}>{s.label}</button>
          ))}
        </div>
        <span className="text-[11px] text-dim">Reuters · CNBC · CoinDesk · Cointelegraph · MarketWatch · Yahoo — deduped</span>
      </div>
      <NewsList key={scope} url={`/api/news?scope=${scope}`} limit={30} />
    </div>
  );
}

