"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SearchModal from "./SearchModal";
import { UQuote } from "@/lib/service";
import { fmtPrice, fmtChange } from "@/lib/format";

export default function TopBar() {
  const [open, setOpen] = useState(false);
  const [tape, setTape] = useState<UQuote[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let stop = false;
    const load = () =>
      fetch("/api/quotes?ids=sp500,nasdaq,kospi,nikkei,btc,us10y,gold")
        .then((r) => r.json())
        .then((j) => { if (!stop) setTape(j.quotes ?? []); })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => { stop = true; clearInterval(t); };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-12 items-center gap-4 border-b border-line bg-panel px-4">
        <Link href="/" className="flex items-center gap-2 font-bold whitespace-nowrap">
          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-md bg-gradient-to-br from-accent to-cyan-500 text-xs text-white">M</span>
          MarketBrief
        </Link>
        <button onClick={() => setOpen(true)}
          className="flex h-8 w-full max-w-[380px] items-center gap-2 rounded-lg border border-line bg-panel2 px-3 text-left text-sm text-dim hover:border-accent">
          <span>⌕</span> Search assets…
          <kbd className="ml-auto rounded border border-line bg-chip px-1.5 text-[10px]">⌘K</kbd>
        </button>
        <div className="num ml-auto hidden gap-5 overflow-hidden whitespace-nowrap text-xs text-muted lg:flex">
          {tape.map((q) => {
            const c = fmtChange(q);
            return (
              <Link key={q.id} href={`/asset/${q.id}`} className="hover:text-txt">
                <b className="text-txt">{q.name.length > 12 ? q.id.toUpperCase() : q.name}</b>{" "}
                {fmtPrice(q.price, q.currency)}{" "}
                <span className={c.up == null ? "" : c.up ? "text-up" : "text-down"}>{c.text}</span>
              </Link>
            );
          })}
        </div>
      </header>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

