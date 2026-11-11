import "server-only";

import { getCurrentUser } from "./auth";
import { BackendError } from "./backend";
import { cameraUrl, validId } from "./monitoring-validation";

export interface CctvCamera {
  id: string;
  name: string;
  status: string;
  running: boolean;
  connected: boolean;
}

export async function requireCctvAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new BackendError("Silakan login kembali.", 401);
  if (user.role !== "admin") throw new BackendError("Tes koneksi CCTV hanya tersedia untuk Super Admin.", 403);
}

export async function cctvRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const baseUrl = (process.env.CCTV_API_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new BackendError("Layanan CCTV belum dapat dihubungi. Periksa server dan CCTV_API_URL.", 502);
  }
  if (!response.ok) {
    throw new BackendError(
      response.status === 404 ? "Kamera tidak ditemukan di layanan CCTV." : "Layanan CCTV gagal memproses permintaan.",
      response.status >= 500 ? 502 : response.status,
    );
  }
  try {
    return await response.json();
  } catch {
    throw new BackendError("Respons layanan CCTV tidak valid.", 502);
  }
}

export async function listCctv(): Promise<CctvCamera[]> {
  const [cameras, live] = await Promise.all([
    cctvRequest("/cameras/"),
    cctvRequest("/cameras/status/live"),
  ]);
  if (!Array.isArray(cameras) || !live || typeof live !== "object" || Array.isArray(live)) {
    throw new BackendError("Respons daftar atau status CCTV tidak valid.", 502);
  }
  const statuses = live as Record<string, unknown>;
  return cameras.map((camera) => {
    if (!camera || !validId(camera.id) || typeof camera.name !== "string" || typeof camera.status !== "string") {
      throw new BackendError("Data kamera tidak valid.", 502);
    }
    const worker = statuses[camera.id];
    const state = worker && typeof worker === "object" ? worker as Record<string, unknown> : {};
    return {
      id: camera.id,
      name: camera.name,
      status: camera.status,
      running: state.running === true,
      connected: state.connected === true,
    };
  });
}

export function parseCctvRegistration(input: unknown) {
  if (!input || typeof input !== "object") throw new BackendError("Data kamera tidak valid.", 400);
  const value = input as Record<string, unknown>;
  const url = cameraUrl(value.stream_url);
  if (typeof value.name !== "string" || !value.name.trim() || !url || !validId(value.environment_id)) {
    throw new BackendError("Isi nama, URL RTSP/HTTP, dan ID jenis area layanan CCTV yang valid.", 400);
  }
  if (value.location_id != null && value.location_id !== "" && !validId(value.location_id)) {
    throw new BackendError("ID lokasi tidak valid.", 400);
  }
  return {
    name: value.name.trim(),
    stream_url: url,
    environment_id: value.environment_id,
    location_id: value.location_id || null,
    target_fps: 5,
    status: "inactive",
  };
}
