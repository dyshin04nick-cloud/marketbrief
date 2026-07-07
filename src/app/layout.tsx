import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import SideNav from "@/components/SideNav";

export const metadata: Metadata = {
  title: "MarketBrief — curated market data",
  description: "TradingView-depth market data for a curated universe: US/KR/JP/CN stocks, indices, government bonds, crypto, gold & silver.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        <div className="flex min-h-[calc(100vh-48px)]">
          <SideNav />
          <main className="flex-1 px-5 py-4 max-w-[1600px] min-w-0">{children}</main>
        </div>
      </body>
    </html>
  );
}

