"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { backendRequest, BackendError } from "@/lib/backend";
import { locationName, validLocationId } from "@/lib/location-validation";

type Result = { success: true } | { success: false; message: string };

async function mutate(method: "POST" | "PATCH" | "DELETE", id: unknown, input?: unknown): Promise<Result> {
  const admin = await getCurrentUser();
  if (!admin) return { success: false, message: "Sesi login berakhir. Silakan masuk kembali." };
  if (admin.role !== "admin") return { success: false, message: "Hanya admin yang dapat mengelola lokasi." };
  if (method !== "POST" && !validLocationId(id)) return { success: false, message: "ID lokasi tidak valid." };
  const name = method === "DELETE" ? null : locationName(input);
  if (method !== "DELETE" && !name) return { success: false, message: "Nama lokasi wajib diisi, maksimal 100 karakter." };
  try {
    await backendRequest(method === "POST" ? "/locations/" : `/locations/${encodeURIComponent(id as string)}`, {
      method,
      ...(method !== "DELETE" ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      } : {}),
    });
  } catch (error) {
    return { success: false, message: error instanceof BackendError ? error.message : "Gagal memproses lokasi. Silakan coba lagi." };
  }
  revalidatePath("/dashboard/location-management");
  return { success: true };
}

export async function createLocation(name: unknown): Promise<Result> {
  return mutate("POST", null, name);
}

export async function updateLocation(id: unknown, name: unknown): Promise<Result> {
  return mutate("PATCH", id, name);
}

export async function deleteLocation(id: unknown): Promise<Result> {
  return mutate("DELETE", id);
}
