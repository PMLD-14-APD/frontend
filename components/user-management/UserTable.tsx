"use client";

import type { User } from "@/type/user";
import DataTable, { type DataTableColumn } from "../ui/DataTable";
import { Pencil, Trash2 } from "lucide-react";
interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId: string;
  disabled?: boolean;
}

export default function UserTable({ users, onEdit, onDelete, currentUserId, disabled }: UserTableProps) {
  const columns: DataTableColumn<User>[] = [
    {
      key: "name",
      header: "Nama Pengguna",
      className: "px-5 py-4 text-zinc-800",
      headerClassName: "px-5 py-4",
      render: (user) => user.name,
    },
    {
      key: "username",
      header: "Username",
      className: "px-5 py-4 text-zinc-600",
      headerClassName: "px-5 py-4",
      render: (user) => user.username,
    },
    {
      key: "role",
      header: "Peran",
      className: "px-5 py-4",
      headerClassName: "px-5 py-4",
      render: (user) => (user.role === "admin" ? "Admin" : "User"),
    },
    {
      key: "actions",
      header: "Aksi",
      className: "px-5 py-4 text-center",
      headerClassName: "px-5 py-4 text-center",
      render: (user) => (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            disabled={disabled}
            aria-label={`Ubah pengguna ${user.name}`}
            className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF0] px-2.5 py-1 text-xs text-[#4D0077] hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Pencil size={15} />
            Ubah
          </button>

          <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={disabled || user.id === currentUserId}
            title={user.id === currentUserId ? "Tidak bisa menghapus akun sendiri" : undefined}
            aria-label={`Hapus pengguna ${user.name}`}
            className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 size={15} />
            Hapus
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      items={users}
      columns={columns}
      getRowKey={(user) => user.id}
      headerClassName="bg-[#EEEAF0]"
      emptyState={{
        title: "Belum Ada Pengguna",
        description: "Daftarkan pengguna untuk mulai mengelola akses sistem.",
      }}
    />
  );
}
