"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Markets", icon: "▤" },
  { href: "/watchlist", label: "Watchlist", icon: "★" },
  { href: "/news", label: "News", icon: "📰" },
];

export default function SideNav() {
  const path = usePathname();
  return (
    <nav className="sticky top-12 flex h-[calc(100vh-48px)] w-14 flex-col items-center gap-1 border-r border-line bg-panel py-3">
      {items.map((it) => (
        <Link key={it.href} href={it.href} title={it.label}
          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${
            path === it.href ? "bg-accent/15 text-accent2" : "text-dim hover:bg-hover2 hover:text-txt"}`}>
          {it.icon}
        </Link>
      ))}
    </nav>
  );
}

