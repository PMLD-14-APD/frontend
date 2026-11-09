import { NextRequest, NextResponse } from "next/server";
import { getAnalysis } from "@/lib/monitoring";
import { BackendError } from "@/lib/backend";
import { validId } from "@/lib/monitoring-validation";

export async function GET(request: NextRequest, { params }: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await params;
  const offset = Number(request.nextUrl.searchParams.get("offset") || 0);
  if (!validId(sourceId) || !Number.isSafeInteger(offset) || offset < 0) return NextResponse.json({ message: "Parameter tidak valid." }, { status: 400 });
  try {
    return NextResponse.json(await getAnalysis(sourceId, offset), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ message: error instanceof BackendError ? error.message : "Gagal memuat analisis." },
      { status: error instanceof BackendError ? error.status : 502, headers: { "Cache-Control": "no-store" } });
  }
}
