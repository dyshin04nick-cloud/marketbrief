"use client";
import { useEffect, useState } from "react";
import { getWatchlist, toggleWatch } from "@/lib/watchlist";

export default function WatchStar({ id }: { id: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const sync = () => setOn(getWatchlist().includes(id));
    sync();
    window.addEventListener("watchlist-changed", sync);
    return () => window.removeEventListener("watchlist-changed", sync);
  }, [id]);
  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatch(id); }}
      className={`text-sm ${on ? "text-yellow-400" : "text-dim hover:text-muted"}`}
      title={on ? "Remove from watchlist" : "Add to watchlist"}>
      {on ? "★" : "☆"}
    </button>
  );
}

