
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import Button from "../../../components/ui/Button";
import SearchInput from "../../../components/ui/SearchInput";
import PageHeader from "../../../components/ui/PageHeader";
import EmptyState from "../../../components/ui/EmptyState";
import UserFormModal from "../../../components/user-management/UserFormModal";

export default function UserManagementPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="space-y-7">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola data akun dan hak akses pengguna sistem sesuai peran operasional."
      />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Cari berdasarkan nama atau username..."
          className="max-w-[440px]"
        />

        <Button
          icon={<Plus size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Tambah Pengguna
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white">
        <table className="w-full text-left">
          <thead className="bg-[#EEEAF0]">
            <tr className="text-xs text-zinc-800">
              <th className="px-5 py-4">Nama Pengguna</th>
              <th className="px-5 py-4">Username</th>
              <th className="px-5 py-4">Peran</th>
              <th className="px-5 py-4">Aksi</th>
            </tr>
          </thead>
        </table>

        <EmptyState
          title="Belum Ada Pengguna Lain"
          description="Daftarkan tim operasional Anda untuk membantu mengawasi kepatuhan APD bersama."
        />
      </div>

      <UserFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
      />
    </section>
  );
}
