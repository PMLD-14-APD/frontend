import { NextResponse } from "next/server";
import { backendFetch, BackendError } from "@/lib/backend";

export async function GET(_request: Request, { params }: { params: Promise<{ logId: string }> }) {
  const { logId } = await params;
  if (!/^[1-9]\d*$/.test(logId)) return new NextResponse(null, { status: 400 });
  try {
    const response = await backendFetch(`/detection-logs/${logId}/image`, { headers: { Accept: "image/jpeg" }, redirect: "error" });
    if (!response.ok) return new NextResponse(null, { status: response.status });
    if (response.headers.get("content-type")?.split(";")[0] !== "image/jpeg") return new NextResponse(null, { status: 502 });
    return new NextResponse(response.body, { headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" } });
  } catch (error) { return new NextResponse(null, { status: error instanceof BackendError ? error.status : 502 }); }
}
