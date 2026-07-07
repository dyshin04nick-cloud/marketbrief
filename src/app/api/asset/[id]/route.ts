import { NextRequest, NextResponse } from "next/server";
import { byId } from "@/config/universe";
import { quotesFor, fundamentalsFor, newsFor } from "@/lib/service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const asset = byId(params.id);
  if (!asset) return NextResponse.json({ error: "not found" }, { status: 404 });
  const [quotes, fundamentals, news] = await Promise.all([
    quotesFor([asset]).catch(() => []),
    fundamentalsFor(params.id).catch(() => null),
    newsFor(params.id).catch(() => []),
  ]);
  return NextResponse.json({ asset, quote: quotes[0] ?? null, fundamentals, news });
}

