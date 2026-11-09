import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend";
import { MAX_VIDEO_BYTES } from "@/lib/monitoring-validation";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return NextResponse.json({ message: "Asal permintaan tidak valid." }, { status: 403 });
  const token = (await cookies()).get("apd_access_token")?.value;
  if (!token) return NextResponse.json({ message: "Silakan masuk kembali." }, { status: 401 });
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.startsWith("multipart/form-data;")) return NextResponse.json({ message: "Format upload tidak valid." }, { status: 400 });
  if (Number(request.headers.get("content-length") || 0) > MAX_VIDEO_BYTES + 1024 * 1024) return NextResponse.json({ message: "Video maksimal 500 MB." }, { status: 413 });
  try {
    // Forward the multipart stream without loading a whole video into server memory.
    const init: RequestInit & { duplex: "half" } = { method: "POST", body: request.body,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": contentType }, duplex: "half",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(300000)]) };
    const response = await fetch(`${getBackendUrl()}/video-sources/upload`, init);
    if (!response.ok) {
      return NextResponse.json({ message: response.status === 413 ? "Ukuran video melebihi batas backend." : "Upload gagal. Periksa format video, lokasi, jenis area, dan akses akun Anda." },
        { status: response.status, headers: { "Cache-Control": "no-store" } });
    }
    // Do not expose file paths, stream URLs, or backend validation inputs.
    await response.body?.cancel();
    revalidatePath("/dashboard"); revalidatePath("/dashboard/location-management");
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ message: "Upload belum dapat dikonfirmasi. Periksa daftar sumber sebelum mencoba lagi." }, { status: 502 }); }
}
