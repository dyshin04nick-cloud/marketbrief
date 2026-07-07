"use client";
import { useEffect, useState } from "react";
import type { NewsItem } from "@/lib/news";
import { timeAgo } from "@/lib/format";

export default function NewsList({ url, limit = 12 }: { url: string; limit?: number }) {
  const [items, setItems] = useState<NewsItem[] | null>(null);

  useEffect(() => {
    let stop = false;
    fetch(url).then((r) => r.json())
      .then((j) => !stop && setItems(j.items ?? j.news ?? []))
      .catch(() => !stop && setItems([]));
    return () => { stop = true; };
  }, [url]);

  if (!items) return <div className="p-5 text-center text-sm text-dim animate-pulse">Loading news…</div>;
  if (!items.length) return <div className="p-5 text-center text-sm text-dim">No recent articles from whitelisted sources.</div>;

  return (
    <div>
      {items.slice(0, limit).map((n, i) => (
        <a key={i} href={n.link} target="_blank" rel="noopener noreferrer"
          className="block border-b border-line px-4 py-3 last:border-0 hover:bg-hover2">
          <h4 className="text-[13px] font-semibold leading-snug">{n.title}</h4>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-dim">
            <span className="font-semibold text-muted">{n.source}</span>
            <span>·</span><span>{timeAgo(n.ts)}</span>
            {n.tag && <span className="badge">{n.tag}</span>}
          </div>
        </a>
      ))}
    </div>
  );
}

