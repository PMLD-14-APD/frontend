"use client";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Video, FileVideo } from "lucide-react";
import PageHeader from "../ui/PageHeader";
import SearchInput from "../ui/SearchInput";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";
import SourceDialog from "./SourceDialog";
import { removeSource } from "@/app/dashboard/monitoring-actions";
import type { MonitoringData, SourceCard } from "@/type/monitoring";

export default function MonitoringClient({ data, error }: { data: MonitoringData; error: string | null }) {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<SourceCard | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = useMemo(() => data.sources.filter((source) => (!location || source.locationId === location) &&
    `${source.name} ${source.locationName}`.toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id"))), [data.sources, search, location]);
  return (
    <section className="space-y-7">
      <PageHeader title="Monitoring Kepatuhan APD" description="Verifikasi keselamatan dan kelengkapan proteksi kerja secara objektif di seluruh titik operasional." />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Cari berdasarkan lokasi atau kamera..." className="lg:flex-1" />
        <select aria-label="Filter lokasi" value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-xl border border-zinc-100 bg-white px-4 py-2.5 text-sm text-zinc-700 lg:w-56">
          <option value="">Semua Lokasi</option>{data.locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <Button icon={<Plus size={16} />} disabled={!!error || pending} onClick={() => setAdding(true)}>Tambah Kamera</Button>
      </div>
      {error ? <div role="alert" className="space-y-3 rounded-xl bg-red-50 p-4 text-sm text-red-600"><p>{error}</p><Button variant="secondary" disabled={pending} onClick={() => startTransition(() => router.refresh())}>Coba Lagi</Button></div>
        : filtered.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((source) => (
              <article key={source.id} className="overflow-hidden rounded-xl bg-white">
                <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#EEEAF0] to-purple-50 text-[#4D0077]">
                  {source.sourceType === "cctv_stream" ? <Video size={42} strokeWidth={1.2} /> : <FileVideo size={42} strokeWidth={1.2} />}
                  <span className="text-xs">{source.sourceType === "cctv_stream" ? "Sumber CCTV" : "Video Unggahan"}</span>
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate text-sm font-medium text-zinc-900" title={source.name}>{source.name}</h2><p className="mt-1 text-xs text-zinc-500">{source.locationName}</p></div>
                    <button type="button" disabled={pending} aria-label={`Hapus ${source.name}`} onClick={() => { setDeleteError(""); setDeleting(source); }} className="rounded-lg bg-red-50 p-1.5 text-red-600"><Trash2 size={15} /></button>
                  </div>
                  <Link href={`/dashboard/monitoring/${source.id}`} className="block rounded-xl bg-[#EEEAF0] px-4 py-2 text-center text-xs font-medium text-[#4D0077] hover:bg-purple-100">Lihat Analisis</Link>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="rounded-xl bg-white"><EmptyState icon={<Video size={22} />} title={search || location ? "Sumber Tidak Ditemukan" : "Belum Ada Sumber Pemantauan"} description={search || location ? "Coba kata kunci atau lokasi lainnya." : "Tambahkan kamera CCTV atau unggah video untuk mulai menganalisis kepatuhan APD."} /></div>}
      {adding && <SourceDialog locations={data.locations} environments={data.environments} onClose={() => setAdding(false)} />}
      {deleting && <Modal open closeDisabled={pending} onClose={() => setDeleting(null)} title={`Hapus ${deleting.name}`} description="Sumber video, seluruh sesi analisis, statistik, dan dokumentasi deteksinya akan dihapus. Tindakan ini tidak dapat dibatalkan.">
        {deleteError && <p role="alert" className="mb-4 text-sm text-red-600">{deleteError}</p>}
        <div className="flex justify-end gap-4"><button type="button" disabled={pending} onClick={() => setDeleting(null)} className="text-sm text-[#4D0077]">Batal</button>
          <Button variant="danger" isLoading={pending} onClick={() => startTransition(async () => {
            try { const result = await removeSource(deleting.id); if (result.success) setDeleting(null); else setDeleteError(result.message); }
            catch { setDeleteError("Penghapusan belum dapat dikonfirmasi. Muat ulang daftar sebelum mencoba lagi."); }
          })}>Hapus Sumber</Button>
        </div>
      </Modal>}
    </section>
  );
}
