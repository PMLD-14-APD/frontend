import type { UserRole } from "@/type/user";

export interface CreateUserInput {
  name: string;
  username: string;
  role: UserRole;
  password: string;
  confirm_password: string;
}

export function validateCreateUser(input: unknown, editing = false):
  | { success: true; data: CreateUserInput }
  | { success: false; message: string } {
  if (!input || typeof input !== "object") {
    return { success: false, message: "Data pengguna tidak valid." };
  }
  const value = input as Record<string, unknown>;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const username = typeof value.username === "string" ? value.username.trim().toLowerCase() : "";
  const password = typeof value.password === "string" ? value.password : "";
  if (!name || name.length > 100) return { success: false, message: "Nama wajib diisi, maksimal 100 karakter." };
  if (!/^[a-zA-Z0-9_.-]{3,50}$/.test(username)) {
    return { success: false, message: "Username harus 3–50 karakter, hanya huruf, angka, titik, garis bawah, atau tanda hubung." };
  }
  if ((!editing || password) && (password.length < 8 || new TextEncoder().encode(password).length > 72)) {
    return { success: false, message: "Password minimal 8 karakter dan maksimal 72 byte." };
  }
  if (password !== value.confirm_password) {
    return { success: false, message: "Konfirmasi password tidak sesuai." };
  }
  if (value.role !== "admin" && value.role !== "user") {
    return { success: false, message: "Peran pengguna tidak valid." };
  }
  return { success: true, data: { name, username, password, confirm_password: password, role: value.role } };
}
