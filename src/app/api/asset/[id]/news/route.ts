import { NextRequest, NextResponse } from "next/server";
import { newsFor } from "@/lib/service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ items: await newsFor(params.id) });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message }, { status: 502 });
  }
}

