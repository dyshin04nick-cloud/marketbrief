import { NextRequest, NextResponse } from "next/server";
import { chartFor } from "@/lib/service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const range = req.nextUrl.searchParams.get("range") ?? "1M";
  try {
    const data = await chartFor(params.id, range);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ type: "line", points: [], unavailableReason: e?.message ?? "upstream error" }, { status: 502 });
  }
}

