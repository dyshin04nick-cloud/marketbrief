import { NextRequest, NextResponse } from "next/server";
import { INDICES, STOCKS, CRYPTO, BONDS, COMMODITIES, ALL_ASSETS } from "@/config/universe";
import { quotesFor } from "@/lib/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const group = req.nextUrl.searchParams.get("group") ?? "indices";
  const ids = req.nextUrl.searchParams.get("ids");
  let assets;
  if (ids) {
    const want = ids.split(",");
    assets = ALL_ASSETS.filter((a) => want.includes(a.id));
  } else {
    switch (group) {
      case "indices": assets = INDICES; break;
      case "crypto": assets = CRYPTO; break;
      case "bonds": assets = BONDS; break;
      case "commodities": assets = COMMODITIES; break;
      case "stocks": assets = STOCKS; break;
      case "us": case "kr": case "jp": case "cn":
        assets = STOCKS.filter((a) => a.country.toLowerCase() === group); break;
      default: assets = INDICES;
    }
  }
  try {
    const quotes = await quotesFor(assets);
    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ quotes: [], error: e?.message ?? "upstream error" }, { status: 502 });
  }
}

