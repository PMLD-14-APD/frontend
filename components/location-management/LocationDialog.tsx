"use client";

import { useState, useTransition } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import TextInput from "../ui/TextInput";
import { createLocation, updateLocation, deleteLocation } from "@/app/dashboard/location-management/actions";
import { LOCATION_NAME_MAX, locationName } from "@/lib/location-validation";
import type { LocationRow } from "@/type/location";

export type LocationDialogState = { mode: "create" } | { mode: "edit" | "delete"; location: LocationRow };

export default function LocationDialog({ dialog, onClose }: { dialog: LocationDialogState; onClose: () => void }) {
  const [name, setName] = useState(dialog.mode === "create" ? "" : dialog.location.name);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const removing = dialog.mode === "delete";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    if (!removing && !locationName(name)) {
      setError("Nama lokasi wajib diisi, maksimal 100 karakter.");
      return;
    }
    startTransition(async () => {
      try {
        const result = dialog.mode === "create" ? await createLocation(name)
          : dialog.mode === "edit" ? await updateLocation(dialog.location.id, name)
            : await deleteLocation(dialog.location.id);
        if (!result.success) { setError(result.message); return; }
        onClose();
      } catch {
        setError("Tidak dapat memproses permintaan. Silakan coba lagi.");
      }
    });
  }

  return (
    <Modal open onClose={onClose} closeDisabled={pending}
      title={dialog.mode === "create" ? "Tambah Lokasi" : dialog.mode === "edit" ? "Ubah Lokasi" : `Hapus ${dialog.location.name}`}
      description={dialog.mode === "create" ? "Tambahkan Lokasi Kamera Baru" : dialog.mode === "edit" ? "Ubah Lokasi Kamera saat ini" : "Kamera tetap tersimpan, tetapi tidak lagi terhubung ke lokasi ini. Tindakan ini tidak dapat dibatalkan."}>
      <form onSubmit={submit} aria-busy={pending} className="space-y-5">
        {!removing && (
          <div className="space-y-1.5">
            <TextInput label="Nama Lokasi" name="name" placeholder="Fakultas Kedokteran" value={name}
              onChange={(event) => setName(event.target.value)} disabled={pending} required autoFocus />
            <p className="text-xs text-zinc-400">Maksimal {LOCATION_NAME_MAX} karakter</p>
          </div>
        )}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-4 pt-3">
          <button type="button" disabled={pending} onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-[#4D0077] disabled:opacity-50">Batal</button>
          <Button type="submit" variant={removing ? "danger" : "primary"} isLoading={pending}>
            {removing ? "Hapus Lokasi" : dialog.mode === "create" ? "Tambah" : "Simpan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
