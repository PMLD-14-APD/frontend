"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Video } from "lucide-react";
import type { CctvCamera } from "@/lib/cctv";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import TextInput from "@/components/ui/TextInput";

export default function CctvTestClient({
  initialCameras,
  initialError,
}: {
  initialCameras: CctvCamera[];
  initialError: string | null;
}) {
  const [cameras, setCameras] = useState(initialCameras);
  const [error, setError] = useState(initialError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [environment, setEnvironment] = useState("");

  useEffect(() => {
    if (pending) return;
    let disposed = false;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    async function load() {
      if (document.hidden) return;
      controller?.abort();
      const active = new AbortController();
      controller = active;
      try {
        const response = await fetch("/api/cctv/cameras", {
          cache: "no-store",
          signal: AbortSignal.any([active.signal, AbortSignal.timeout(20000)]),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Gagal membaca status kamera.");
        if (!Array.isArray(result)) throw new Error("Respons daftar kamera tidak valid.");
        if (!disposed && !active.signal.aborted) {
          setCameras(result);
          setError(null);
          failures = 0;
        }
      } catch (cause) {
        if (!disposed && !active.signal.aborted) {
          failures += 1;
          setError(cause instanceof Error ? cause.message : "Gagal membaca status kamera.");
        }
      } finally {
        if (!disposed && !active.signal.aborted) {
          timer = setTimeout(load, Math.min(30000, 5000 * 2 ** failures));
        }
      }
    }

    function visibility() {
      if (timer) clearTimeout(timer);
      controller?.abort();
      if (!document.hidden) void load();
    }
    if (revision) void load();
    else timer = setTimeout(load, 5000);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      controller?.abort();
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [pending, revision]);

  async function perform(path: string, payload?: object) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setActionError(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        ...(payload ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        } : {}),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Permintaan gagal.");
      if (payload) {
        setAdding(false);
        setName("");
        setUrl("");
        setEnvironment("");
      }
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Status permintaan belum dapat dikonfirmasi. Perbarui daftar sebelum mencoba lagi.");
    } finally {
      busy.current = false;
      setPending(false);
      setRevision((value) => value + 1);
    }
  }

  return (
    <section className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#4D0077]">
        <ArrowLeft size={16} /> Kembali ke Monitoring
      </Link>
      <PageHeader title="Tes Koneksi CCTV" description="Daftarkan kamera dan periksa koneksi stream melalui layanan CCTV." />
      <p className="text-sm text-zinc-500">Kamera pada halaman ini terdaftar di layanan CCTV Naziri. Status Terhubung menunjukkan stream berhasil dibuka. Pengujian deteksi APD dilakukan dari halaman analisis setelah model tersedia.</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" disabled={pending} onClick={() => setRevision((value) => value + 1)}>Perbarui</Button>
        <Button disabled={pending} onClick={() => { setActionError(null); setAdding(true); }}>Daftarkan Kamera</Button>
      </div>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error} Data sebelumnya mungkin belum mutakhir.</p>}
      {actionError && !adding && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cameras.map((camera) => (
          <article key={camera.id} className="space-y-4 rounded-xl bg-white p-5">
            <Video className="text-[#4D0077]" size={30} />
            <h2 className="break-words text-sm font-medium text-zinc-900">{camera.name}</h2>
            <p className="text-xs text-zinc-500">{camera.connected ? "Terhubung" : camera.running ? "Mencoba terhubung" : "Berhenti"}</p>
            <Button size="sm" variant={camera.running ? "secondary" : "primary"} disabled={pending || !!error}
              onClick={() => perform(`/api/cctv/cameras/${camera.id}/${camera.running ? "stop" : "start"}`)}>
              {camera.running ? "Hentikan Stream" : "Mulai Stream"}
            </Button>
          </article>
        ))}
      </div>
      {!error && !cameras.length && <EmptyState title="Belum Ada Kamera Uji" description="Daftarkan kamera ke layanan CCTV untuk memulai tes koneksi." />}
      {adding && (
        <Modal open closeDisabled={pending} onClose={() => setAdding(false)} title="Daftarkan Kamera Uji">
          <form className="space-y-4" aria-busy={pending} onSubmit={(event) => {
            event.preventDefault();
            void perform("/api/cctv/cameras", { name, stream_url: url, environment_id: environment });
          }}>
            <TextInput label="Nama Kamera" value={name} onChange={(event) => setName(event.target.value)} required disabled={pending} />
            <TextInput label="URL Stream" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="rtsp://192.168.1.12:8080/h264_ulaw.sdp" required disabled={pending} autoComplete="off" />
            <TextInput label="ID Jenis Area Layanan CCTV" value={environment} onChange={(event) => setEnvironment(event.target.value)} required disabled={pending} />
            <p className="text-xs text-zinc-500">Gunakan ID environment yang tersedia di database layanan CCTV Naziri.</p>
            {actionError && <p role="alert" className="text-sm text-red-600">{actionError}</p>}
            <div className="flex justify-end gap-4">
              <Button variant="secondary" disabled={pending} onClick={() => setAdding(false)}>Batal</Button>
              <Button type="submit" isLoading={pending}>Daftarkan</Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
