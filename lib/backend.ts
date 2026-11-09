import "server-only";

import { cookies } from "next/headers";

export function getBackendUrl(): string {
  return (process.env.API_URL || process.env.FASTAPI_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");
}

export class BackendError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "BackendError";
  }
}

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = (await cookies()).get("apd_access_token")?.value;
  if (!token) throw new BackendError("Sesi login berakhir. Silakan masuk kembali.", 401);

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");

  try {
    return await fetch(`${getBackendUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: init.signal ?? AbortSignal.timeout(15000),
    });
  } catch {
    throw new BackendError("Tidak dapat terhubung ke backend. Silakan coba lagi.", 502);
  }
}

export async function backendRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await backendFetch(path, init);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = response.status === 401
      ? "Sesi login berakhir. Silakan masuk kembali."
      : response.status === 403
        ? "Anda tidak memiliki izin untuk melakukan tindakan ini."
        : "Gagal memproses data. Silakan coba lagi.";
    const detail = data && typeof data === "object" && "detail" in data ? data.detail : null;
    // Do not forward validation input values (which may contain passwords) or server errors.
    throw new BackendError(response.status < 500 && typeof detail === "string" ? detail : fallback, response.status);
  }
  if (data === null) throw new BackendError("Respons backend tidak valid.", 502);
  return data;
}
