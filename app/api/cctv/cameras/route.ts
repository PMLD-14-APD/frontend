import { NextResponse } from "next/server";
import { BackendError } from "@/lib/backend";
import { cctvRequest, listCctv, parseCctvRegistration, requireCctvAdmin } from "@/lib/cctv";

export async function GET() {
  try {
    await requireCctvAdmin();
    return NextResponse.json(await listCctv(), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof BackendError ? error.message : "Gagal membaca CCTV." },
      { status: error instanceof BackendError ? error.status : 502 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireCctvAdmin();
    if (request.headers.get("origin") !== new URL(request.url).origin) {
      throw new BackendError("Asal permintaan tidak valid.", 403);
    }
    const input = await request.json().catch(() => null);
    const payload = parseCctvRegistration(input);
    await cctvRequest("/cameras/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof BackendError ? error.message : "Pendaftaran kamera belum dapat dikonfirmasi. Perbarui daftar sebelum mencoba lagi." },
      { status: error instanceof BackendError ? error.status : 502 },
    );
  }
}
