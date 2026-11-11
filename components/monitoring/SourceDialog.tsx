"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Video, Upload, Link as LinkIcon } from "lucide-react";
import Modal from "../ui/Modal";
import TextInput from "../ui/TextInput";
import SelectInput from "../ui/SelectInput";
import Button from "../ui/Button";
import { addCamera } from "@/app/dashboard/monitoring-actions";
import { cameraUrl, MAX_VIDEO_BYTES, VIDEO_ACCEPT } from "@/lib/monitoring-validation";
import type { Option } from "@/type/monitoring";

export default function SourceDialog({ locations, environments, onClose }: { locations: Option[]; environments: Option[]; onClose: () => void }) {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [name, setName] = useState("");
  const [locationId, setLocationId] = useState("");
  const [environmentId, setEnvironmentId] = useState(environments.length === 1 ? environments[0].id : "");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function chooseFile(value: File | undefined) {
    setError("");
    if (!value) return;
    if (!/\.(mp4|avi|mov|mkv|webm)$/i.test(value.name) || !value.size || value.size > MAX_VIDEO_BYTES) {
      setFile(null); setError("Pilih MP4, AVI, MOV, MKV, atau WEBM, maksimal 500 MB."); return;
    }
    setFile(value);
  }
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending) return; setError("");
    if (!name.trim() || !locationId || !environmentId) { setError("Isi nama, lokasi kamera, dan jenis area."); return; }
    if (mode === "camera" && !cameraUrl(url)) { setError("Masukkan URL RTSP atau HTTP/HTTPS yang valid."); return; }
    if (mode === "upload" && !file) { setError("Pilih video terlebih dahulu."); return; }
    startTransition(async () => {
      try {
        if (mode === "camera") {
          const result = await addCamera({ name, locationId, environmentId, url });
          if (!result.success) { setError(result.message); return; }
        } else {
          const form = new FormData();
          form.set("name", name.trim()); form.set("location_id", locationId); form.set("environment_id", environmentId); form.set("file", file!);
          const response = await fetch("/api/monitoring/upload", { method: "POST", body: form });
          const result = await response.json();
          if (!response.ok) { setError(result.message || "Upload gagal."); return; }
          router.refresh();
        }
        onClose();
      } catch { setError("Permintaan belum dapat dikonfirmasi. Periksa daftar sumber sebelum mencoba lagi."); }
    });
  }
  return (
    <Modal open onClose={onClose} closeDisabled={pending} title="Tambah Sumber Pemantauan" description="Pilih sumber video untuk mulai mendeteksi kepatuhan APD di area kerja.">
      <div className="mb-5 flex rounded-full bg-zinc-50 p-1">
        {([['camera', 'CCTV atau Kamera'], ['upload', 'Upload Video']] as const).map(([key, label]) => (
          <button key={key} type="button" disabled={pending} aria-pressed={mode === key} onClick={() => { setMode(key); setError(""); }}
            className={`flex-1 rounded-full px-3 py-2 text-xs ${mode === key ? "bg-[#EEEAF0] text-[#4D0077]" : "text-zinc-500"}`}>{label}</button>
        ))}
      </div>
      <form onSubmit={submit} aria-busy={pending} className="space-y-4">
        <TextInput label="Nama Kamera" placeholder="Gate Masuk Pabrik" icon={<Video size={16} />} value={name} onChange={(e) => setName(e.target.value)} disabled={pending} required autoFocus />
        <SelectInput label="Lokasi Kamera" placeholder="Pilih area kerja..." value={locationId} onChange={(e) => setLocationId(e.target.value)} disabled={pending} required options={locations.map((item) => ({ value: item.id, label: item.name }))} />
        <SelectInput label="Jenis Area" placeholder="Pilih jenis area untuk model AI..." value={environmentId} onChange={(e) => setEnvironmentId(e.target.value)} disabled={pending} required options={environments.map((item) => ({ value: item.id, label: item.name }))} />
        {mode === "camera" ? (
          <TextInput label="URL RTSP atau IP Kamera" placeholder="rtsp://192.168.1.100:554/stream" icon={<LinkIcon size={16} />} value={url} onChange={(e) => setUrl(e.target.value)} disabled={pending} autoComplete="off" required />
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="source-video" className="block text-xs font-medium text-zinc-800">Upload Video</label>
            <div className="relative rounded-xl border border-dashed border-zinc-300 p-6 text-center" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); if (!pending) chooseFile(e.dataTransfer.files[0]); }}>
              <Upload className="mx-auto mb-3 text-zinc-400" size={26} />
              <button type="button" disabled={pending} onClick={() => inputRef.current?.click()} className="text-xs text-zinc-500">
                {file ? file.name : <>Tarik berkas video ke sini, atau <span className="text-[#4D0077] underline">klik untuk memilih</span></>}
              </button>
              <p className="mt-1 text-[11px] text-zinc-400">MP4, AVI, MOV, MKV, WEBM · Maksimal 500 MB</p>
              <input ref={inputRef} id="source-video" type="file" accept={VIDEO_ACCEPT} disabled={pending} onChange={(e) => chooseFile(e.target.files?.[0])} className="sr-only" />
            </div>
          </div>
        )}
        {(!locations.length || !environments.length) && <p role="status" className="text-xs text-zinc-500">Lokasi dan jenis area harus tersedia terlebih dahulu. Hubungi admin untuk melengkapinya.</p>}
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        {pending && mode === "camera" && <p role="status" className="text-xs text-zinc-500">Memeriksa koneksi kamera. Pastikan kamera aktif dan dapat dijangkau dari server.</p>}
        {pending && mode === "upload" && <p role="status" className="text-xs text-zinc-500">Mengunggah dan memeriksa video. Tunggu hingga selesai.</p>}
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" disabled={pending} onClick={onClose} className="text-sm text-[#4D0077]">Batal</button>
          <Button type="submit" isLoading={pending} disabled={!locations.length || !environments.length}>{mode === "camera" ? "Hubungkan Kamera" : "Unggah"}</Button>
        </div>
      </form>
    </Modal>
  );
}
