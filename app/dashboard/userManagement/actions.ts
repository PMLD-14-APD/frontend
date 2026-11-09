"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { backendRequest, BackendError } from "@/lib/backend";
import { validateCreateUser } from "@/lib/user-validation";
import { validLocationId as validId } from "@/lib/location-validation";

export async function updateUser(id: unknown, input: unknown) {
  const admin = await getCurrentUser();
  if (admin?.role !== "admin") return { success: false, message: "Hanya admin yang dapat mengubah pengguna." } as const;
  if (!validId(id)) return { success: false, message: "ID pengguna tidak valid." } as const;
  if (!input || typeof input !== "object") return { success: false, message: "Data pengguna tidak valid." } as const;
  const changesRole = "role" in input;
  const parsed = validateCreateUser(changesRole ? input : { ...input, role: "user" }, true);
  if (!parsed.success) return parsed;
  const { name, username, role, password, confirm_password } = parsed.data;
  try {
    await backendRequest(`/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, ...(changesRole ? { role } : {}), ...(password ? { password, confirm_password } : {}) }),
    });
  } catch (error) {
    return { success: false, message: error instanceof BackendError ? error.message : "Gagal mengubah pengguna." } as const;
  }
  revalidatePath("/dashboard/userManagement");
  return { success: true } as const;
}

export async function createUser(input: unknown): Promise<
  { success: true } | { success: false; message: string }
> {
  // Recheck authorization for every mutation, independently of page access.
  const admin = await getCurrentUser();
  if (!admin) return { success: false, message: "Sesi login berakhir. Silakan masuk kembali." };
  if (admin.role !== "admin") return { success: false, message: "Hanya admin yang dapat menambahkan pengguna." };

  const parsed = validateCreateUser(input);
  if (!parsed.success) return parsed;

  try {
    await backendRequest("/users/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
  } catch (error) {
    return {
      success: false,
      message: error instanceof BackendError ? error.message : "Gagal menyimpan pengguna. Silakan coba lagi.",
    };
  }

  revalidatePath("/dashboard/userManagement");
  return { success: true };
}

export async function deleteUser(userId: unknown): Promise<
  { success: true } | { success: false; message: string }
> {
  const admin = await getCurrentUser();
  if (!admin) return { success: false, message: "Sesi login berakhir. Silakan masuk kembali." };
  if (admin.role !== "admin") return { success: false, message: "Hanya admin yang dapat menghapus pengguna." };
  if (typeof userId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    return { success: false, message: "ID pengguna tidak valid." };
  }
  if (userId.toLowerCase() === admin.id.toLowerCase()) {
    return { success: false, message: "Tidak bisa menghapus akun sendiri." };
  }
  try {
    await backendRequest(`/users/${encodeURIComponent(userId)}`, { method: "DELETE" });
  } catch (error) {
    return { success: false, message: error instanceof BackendError ? error.message : "Gagal menghapus pengguna. Silakan coba lagi." };
  }
  revalidatePath("/dashboard/userManagement");
  return { success: true };
}
