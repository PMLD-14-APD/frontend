
"use client";

import { useEffect, useState } from "react";
import { CircleUserRound, UserRound } from "lucide-react";

import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import PasswordInput from "../ui/PasswordInput";
import SelectInput from "../ui/SelectInput";
import Button from "../ui/Button";
import { validateCreateUser } from "@/lib/user-validation";

export type UserRole = "admin" | "user";

export interface UserFormValues {
  name: string;
  username: string;
  role: UserRole;
  password: string;
  confirm_password: string;
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: {
    name: string;
    username: string;
    role: UserRole;
  };
  onSubmit?: (values: UserFormValues) => Promise<void>;
  roleLocked?: boolean;
}

export default function UserFormModal({
  open,
  onClose,
  mode = "create",
  initialValues,
  onSubmit,
  roleLocked = false,
}: UserFormModalProps) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Reset the form whenever the modal opens or its initial values change.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return;

    setName(initialValues?.name ?? "");
    setUsername(initialValues?.username ?? "");
    setRole(initialValues?.role ?? "user");
    setPassword("");
    setConfirmation("");
    setError("");
  }, [open, initialValues]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError("");

    const validation = validateCreateUser(
      { name, username, role, password, confirm_password: confirmation },
      mode === "edit",
    );
    if (!validation.success) {
      setError(validation.message);
      return;
    }

    if (!onSubmit) {
      setError("Form belum terhubung ke API penyimpanan.");
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(validation.data);

      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menyimpan pengguna."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      closeDisabled={isLoading}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      title={
        mode === "create"
          ? "Tambah Pengguna"
          : "Ubah Pengguna"
      }
      description={
        mode === "create"
          ? "Tambahkan akun pengguna baru Simovis"
          : "Ubah akun pengguna Simovis"
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextInput
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          icon={<CircleUserRound size={17} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          maxLength={100}
          required
        />

        <TextInput
          label="Username"
          placeholder="Masukkan username"
          icon={<UserRound size={17} />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isLoading}
          minLength={3}
          maxLength={50}
          pattern="[a-zA-Z0-9_.\-]+"
          required
        />

        <SelectInput
          label="Peran"
          placeholder="Pilih Peran"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: "admin", label: "Admin" },
            { value: "user", label: "User" },
          ]}
          disabled={isLoading || roleLocked}
          required
        />

        <PasswordInput
          label="Password"
          placeholder={
            mode === "edit"
              ? "Kosongkan jika tidak diubah"
              : "Masukkan password"
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          required={mode === "create"}
          minLength={mode === "create" ? 8 : undefined}
          maxLength={72}
        />

        <PasswordInput
          label="Konfirmasi Password"
          placeholder="Masukkan ulang password"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          disabled={isLoading}
          autoComplete="new-password"
          required={mode === "create" || password.length > 0}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-4 pt-3">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>

          <Button
            type="submit"
            isLoading={isLoading}
          >
            {mode === "create" ? "Tambah" : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
