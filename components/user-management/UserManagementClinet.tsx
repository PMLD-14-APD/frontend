"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import DeleteUserModal from "./DeleteUserModal";

import type { User } from "@/type/user";
import { createUser, deleteUser, updateUser } from "@/app/dashboard/userManagement/actions";
import Button from "../ui/Button";
import SearchInput from "../ui/SearchInput";
import PageHeader from "../ui/PageHeader";
import UserTable from "./UserTable";
import UserFormModal, { type UserFormValues } from "./UserFormModal";

interface Props {
  initialUsers: User[];
  initialError: string | null;
  currentUserId: string;
}

export default function UserManagementClient({
  initialUsers,
  initialError,
  currentUserId,
}: Props) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (values: UserFormValues): Promise<void> => new Promise((resolve, reject) => {
    startTransition(async () => {
      try {
        const result = await createUser(values);
        if (!result.success) throw new Error(result.message);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeModal, setActiveModal] = useState<"edit" | "delete" | null>(null);

  const handleDelete = (user: User): Promise<void> => new Promise((resolve, reject) => {
    startTransition(async () => {
      try {
        const result = await deleteUser(user.id);
        if (!result.success) throw new Error(result.message);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query)
    );
  }, [initialUsers, search]);

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
          disabled={isPending}
        >
          Tambah Pengguna
        </Button>
      </div>

      {initialError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {initialError}
        </p>
      ) : (
        <UserTable
            users={filteredUsers}
            currentUserId={currentUserId}
            disabled={isPending}
            onEdit={(user) => {
                setSelectedUser(user);
                setActiveModal("edit");
            }}
            onDelete={(user) => {
                setSelectedUser(user);
                setActiveModal("delete");
            }}
/>
      )}

      <UserFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode="create"
        onSubmit={handleCreate}
      />
      <UserFormModal
        key={selectedUser ? `edit-${selectedUser.id}` : "edit"}
        open={activeModal === "edit"}
        onClose={() => setActiveModal(null)}
        mode="edit"
        initialValues={selectedUser ?? undefined}
        roleLocked={selectedUser?.id === currentUserId}
        onSubmit={(values) => new Promise((resolve, reject) => {
          startTransition(async () => {
            try {
              if (!selectedUser) throw new Error("Pilih pengguna terlebih dahulu.");
              const { role, ...profile } = values;
              const result = await updateUser(selectedUser.id, role === selectedUser.role ? profile : values);
              if (!result.success) throw new Error(result.message);
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        })}
      />
      <DeleteUserModal
        key={selectedUser ? `delete-${selectedUser.id}` : "delete"}
        open={activeModal === "delete"}
        user={selectedUser}
        onClose={() => setActiveModal(null)}
        onConfirm={handleDelete}
      />
    </section>
  );
}
