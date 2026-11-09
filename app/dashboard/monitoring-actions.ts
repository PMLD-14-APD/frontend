"use server";
import { revalidatePath } from "next/cache";
import { backendRequest, BackendError } from "@/lib/backend";
import { getCurrentUser } from "@/lib/auth";
import { validId, cameraUrl, sourceName } from "@/lib/monitoring-validation";
import { latestSession } from "@/lib/monitoring";

type Result = { success: true } | { success: false; message: string };
const failure = (error: unknown): Result => ({ success: false, message: error instanceof BackendError ? error.message : "Permintaan gagal. Silakan coba lagi." });
function refresh(sourceId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/location-management");
  if (sourceId) revalidatePath(`/dashboard/monitoring/${sourceId}`);
}

export async function addCamera(input: unknown): Promise<Result> {
  if (!await getCurrentUser()) return { success: false, message: "Silakan masuk kembali." };
  if (!input || typeof input !== "object") return { success: false, message: "Data kamera tidak valid." };
  const data = input as Record<string, unknown>;
  const name = sourceName(data.name), url = cameraUrl(data.url);
  if (!name || !url || !validId(data.environmentId) || !validId(data.locationId)) return { success: false, message: "Isi nama, lokasi, jenis area, dan URL RTSP/HTTP yang valid." };
  try {
    await backendRequest("/video-sources/", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stream_url: url, location_id: data.locationId, environment_id: data.environmentId }) });
  } catch { return { success: false, message: "Kamera gagal ditambahkan. Periksa data, koneksi backend, dan akses akun Anda." }; }
  refresh(); return { success: true };
}

export async function removeSource(id: unknown): Promise<Result> {
  if (!await getCurrentUser()) return { success: false, message: "Silakan masuk kembali." };
  if (!validId(id)) return { success: false, message: "ID sumber tidak valid." };
  try { await backendRequest(`/video-sources/${id}`, { method: "DELETE", signal: AbortSignal.timeout(60000) }); }
  catch (error) { return failure(error); }
  refresh(id); return { success: true };
}

export async function controlAnalysis(sourceId: unknown, command: "start" | "stop"): Promise<Result> {
  if (!await getCurrentUser()) return { success: false, message: "Silakan masuk kembali." };
  if (!validId(sourceId) || !["start", "stop"].includes(command)) return { success: false, message: "Permintaan analisis tidak valid." };
  try {
    await backendRequest(`/video-sources/${sourceId}`);
    let session: unknown = await latestSession(sourceId);
    const status = session && typeof session === "object" && "status" in session ? session.status : null;
    if (command === "stop" && status !== "processing") return { success: false, message: "Tidak ada sesi yang sedang berjalan." };
    if (command === "start" && status === "processing") return { success: false, message: "Analisis sudah berjalan." };
    if (command === "start" && status !== "queued") session = await backendRequest("/analysis-sessions/", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source_id: sourceId }),
    });
    if (!session || typeof session !== "object" || !("id" in session) || !validId(session.id)) throw new Error("Invalid session");
    await backendRequest(`/analysis-sessions/${session.id}/${command}`, { method: "POST", signal: AbortSignal.timeout(60000) });
  } catch (error) { return failure(error); }
  refresh(sourceId); return { success: true };
}
