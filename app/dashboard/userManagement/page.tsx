import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/auth";
import type { User } from "@/type/user";
import { BackendError } from "@/lib/backend";
import { getUsers } from "@/lib/user";
import UserManagementClient from "@/components/user-management/UserManagementClinet";
export default async function UserManagementPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  if (currentUser.role !== "admin") {
    return <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Manajemen Pengguna hanya dapat diakses oleh Super Admin.</p>;
  }

  let users: User[] = [];
  let error: string | null = null;

  try {
    users = await getUsers();
  } catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    error = cause instanceof BackendError ? cause.message : "Gagal memuat daftar pengguna. Silakan coba lagi.";
  }

  return (
    <UserManagementClient
      initialUsers={users}
      initialError={error}
      currentUserId={currentUser.id}
    />
  );
}
