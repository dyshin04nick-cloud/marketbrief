"use client";
import { useEffect, useState } from "react";
import QuoteTable from "@/components/QuoteTable";
import { getWatchlist } from "@/lib/watchlist";

export default function WatchlistPage() {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setIds(getWatchlist());
    sync();
    window.addEventListener("watchlist-changed", sync);
    return () => window.removeEventListener("watchlist-changed", sync);
  }, []);

  if (ids === null) return null;
  return (
    <div className="panel">
      <div className="panel-h">
        <h3 className="text-[13px] font-bold">My Watchlist</h3>
        <span className="text-[11px] text-dim">stored locally in this browser (no account needed)</span>
      </div>
      {ids.length === 0 ? (
        <div className="p-10 text-center text-sm text-dim">
          Empty. Click the ☆ next to any asset to add it.
        </div>
      ) : (
        <QuoteTable ids={ids} />
      )}
    </div>
  );
}

