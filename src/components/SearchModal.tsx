"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ALL_ASSETS } from "@/config/universe";

const CLS_LABEL: Record<string, string> = { index: "Index", stock: "Stock", crypto: "Crypto", bond: "Bond", commodity: "Commodity" };

export default function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => { inputRef.current?.focus(); }, []);

  const needle = q.trim().toLowerCase();
  const results = !needle
    ? ALL_ASSETS.slice(0, 10)
    : ALL_ASSETS.filter((a) =>
        a.name.toLowerCase().includes(needle) ||
        a.id.includes(needle) ||
        a.symbol.toLowerCase().includes(needle) ||
        a.country.toLowerCase() === needle
      ).slice(0, 12);

  const go = (id: string) => { router.push(`/asset/${id}`); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-[12vh]" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl border border-line bg-panel shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef} value={q}
          onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, results.length - 1));
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && results[sel]) go(results[sel].id);
          }}
          placeholder="Search stocks, indices, crypto, bonds, gold…"
          className="w-full border-b border-line bg-transparent px-5 py-4 text-sm outline-none placeholder:text-dim"
        />
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {results.map((a, i) => (
            <button key={a.id} onClick={() => go(a.id)} onMouseEnter={() => setSel(i)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${i === sel ? "bg-hover2" : ""}`}>
              <span className="w-24 shrink-0 font-semibold">{a.cls === "crypto" ? a.id.toUpperCase() : a.symbol}</span>
              <span className="flex-1 truncate text-muted">{a.name}</span>
              <span className="badge">{CLS_LABEL[a.cls]}</span>
              <span className="badge">{a.country}</span>
            </button>
          ))}
          {results.length === 0 && <div className="px-4 py-6 text-center text-sm text-dim">No matches in the curated universe</div>}
        </div>
      </div>
    </div>
  );
}

