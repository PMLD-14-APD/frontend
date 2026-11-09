
"use client";

import { useState } from "react";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { User } from "@/type/user";

interface DeleteUserModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onConfirm: (user: User) => Promise<void>;
}

export default function DeleteUserModal({
  open,
  user,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!user || isDeleting) return;

    setError("");
    setIsDeleting(true);

    try {
      await onConfirm(user);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghapus pengguna."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      title={`Hapus Pengguna ${user?.name ?? ""}`}
      description={`Akun ${user?.name ?? "ini"} tidak akan dapat lagi mengakses dashboard Simovis`}
      closeDisabled={isDeleting}
    >
      <div className="space-y-6">
        {error && (
          <p role="alert" className="text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-center gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Hapus
          </Button>
        </div>
      </div>
    </Modal>
  );
}
