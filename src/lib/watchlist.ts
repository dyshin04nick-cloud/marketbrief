"use client";
// localStorage-backed watchlist (MVP: no accounts / DB).
const KEY = "marketbrief:watchlist";

export function getWatchlist(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

export function toggleWatch(id: string): string[] {
  const list = getWatchlist();
  const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("watchlist-changed"));
  return next;
}

