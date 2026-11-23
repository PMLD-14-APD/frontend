"use client";
import { useState, useTransition } from "react";
import { Video, Link as LinkIcon } from "lucide-react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import Button from "../ui/Button";
import { updateCamera } from "@/app/dashboard/monitoring-actions";
import { cameraUrl } from "@/lib/monitoring-validation";
import type { Option, SourceCard } from "@/type/monitoring";

export default function EditSourceDialog({ source, locations, onClose, onSaved }: { source: SourceCard; locations: Option[]; onClose: () => void; onSaved: () => void }) {
  const isCamera = source.sourceType === "cctv_stream";
  const [name, setName] = useState(source.name);
  const [locationId, setLocationId] = useState(source.locationId ?? "");
  const [url, setUrl] = useState(source.streamUrl ?? "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const urlChanged = isCamera && url.trim() !== (source.streamUrl ?? "");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setError("");
    if (!name.trim() || !locationId) { setError("Isi nama dan lokasi kamera."); return; }
    if (urlChanged && !cameraUrl(url)) { setError("Masukkan URL RTSP atau HTTP/HTTPS yang valid."); return; }
    startTransition(async () => {
      try {
        const result = await updateCamera(source.id, { name, locationId, ...(urlChanged ? { url } : {}) });
        if (!result.success) { setError(result.message); return; }
        onSaved(); onClose();
      } catch { setError("Permintaan belum dapat dikonfirmasi. Muat ulang halaman sebelum mencoba lagi."); }
    });
  }
  return (
    <Modal open onClose={onClose} closeDisabled={pending} title="Ubah Sumber Pemantauan"
      description={isCamera ? "Perbarui nama, lokasi, atau alamat kamera. Riwayat deteksi tetap tersimpan." : "Perbarui nama atau lokasi video. Riwayat deteksi tetap tersimpan."}>
      <form onSubmit={submit} aria-busy={pending} className="space-y-4">
        <TextInput label="Nama Kamera" icon={<Video size={16} />} value={name} onChange={(e) => setName(e.target.value)} disabled={pending} required autoFocus />
        <SelectInput label="Lokasi Kamera" placeholder="Pilih area kerja..." value={locationId} onChange={(e) => setLocationId(e.target.value)} disabled={pending} required options={locations.map((item) => ({ value: item.id, label: item.name }))} />
        {isCamera && <div className="space-y-1.5">
          <TextInput label="URL RTSP atau IP Kamera" placeholder="http://192.168.1.100:4747/video" icon={<LinkIcon size={16} />} value={url} onChange={(e) => setUrl(e.target.value)} disabled={pending} autoComplete="off" required />
          <p className="text-[11px] text-zinc-400">Password tampil sebagai *** dan tetap dipakai jika tidak diganti. URL baru diuji dulu sebelum disimpan; analisis yang sedang berjalan langsung pindah ke alamat baru.</p>
        </div>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {pending && urlChanged && <p role="status" className="text-xs text-zinc-500">Menguji koneksi ke kamera...</p>}
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" disabled={pending} onClick={onClose} className="text-sm text-[#4D0077]">Batal</button>
          <Button type="submit" isLoading={pending}>Simpan</Button>
        </div>
      </form>
    </Modal>
  );
}
