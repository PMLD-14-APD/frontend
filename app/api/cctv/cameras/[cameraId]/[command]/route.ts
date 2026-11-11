import { NextResponse } from "next/server";
import { BackendError } from "@/lib/backend";
import { cctvRequest, requireCctvAdmin } from "@/lib/cctv";
import { validId } from "@/lib/monitoring-validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ cameraId: string; command: string }> },
) {
  try {
    await requireCctvAdmin();
    if (request.headers.get("origin") !== new URL(request.url).origin) {
      throw new BackendError("Asal permintaan tidak valid.", 403);
    }
    const { cameraId, command } = await params;
    if (!validId(cameraId) || !["start", "stop"].includes(command)) {
      throw new BackendError("Perintah atau ID kamera tidak valid.", 400);
    }
    await cctvRequest(`/cameras/${cameraId}/${command}`, { method: "POST" });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof BackendError ? error.message : "Status perintah belum dapat dikonfirmasi. Perbarui daftar sebelum mencoba lagi." },
      { status: error instanceof BackendError ? error.status : 502 },
    );
  }
}
