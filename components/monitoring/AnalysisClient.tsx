"use client";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Maximize2, Video, X } from "lucide-react";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Modal from "../ui/Modal";
import { controlAnalysis } from "@/app/dashboard/monitoring-actions";
import { jakartaDay } from "@/lib/monitoring-validation";
import type { AnalysisData, Detection } from "@/type/monitoring";

const statusNames = { queued: "Siap dianalisis", processing: "Analisis berjalan", done: "Analisis selesai", failed: "Analisis gagal" };
const timestamp = (value: string, dateOnly = false) => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...(dateOnly ? { dateStyle: "medium" as const } : { timeStyle: "medium" as const }) }).format(new Date(value));

function EvidenceImage({ log, large = false }: { log: Detection; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <p role="status" className="p-8 text-center text-sm text-zinc-500">Dokumentasi tidak tersedia atau sesi login berakhir.</p>;
  return <Image src={`/api/monitoring/evidence/${log.id}`} alt={`Dokumentasi pelanggaran: ${log.violation}`} width={1280} height={720} unoptimized onError={() => setFailed(true)} className={large ? "max-h-[75dvh] w-full object-contain" : "aspect-video w-full object-contain"} />;
}

export default function AnalysisClient({ sourceId, initialData, initialError }: { sourceId: string; initialData: AnalysisData | null; initialError: string | null }) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [actionError, setActionError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [date, setDate] = useState("");
  const [expanded, setExpanded] = useState<Detection | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const processing = data?.session?.status === "processing";

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let failures = 0;
    async function load() {
      if (document.hidden) return;
      controller?.abort();
      const active = new AbortController(); controller = active;
      setLoading(true);
      try {
        const response = await fetch(`/api/monitoring/${sourceId}?offset=${offset}`, { cache: "no-store", signal: AbortSignal.any([active.signal, AbortSignal.timeout(20000)]) });
        const value = await response.json();
        if (!response.ok) throw new Error(value.message || "Gagal memuat analisis.");
        if (!cancelled && !active.signal.aborted) { setData(value); setError(null); failures = 0; }
      } catch (cause) {
        if (!cancelled && !active.signal.aborted) { failures += 1; setError(cause instanceof Error ? cause.message : "Gagal memuat analisis."); }
      } finally {
        if (!cancelled && controller === active) { setLoading(false); if (processing && !active.signal.aborted) timer = setTimeout(load, Math.min(30000, 5000 * 2 ** failures)); }
      }
    }
    const visibility = () => {
      if (timer) clearTimeout(timer);
      if (document.hidden) controller?.abort(); else void load();
    };
    if (offset !== 0 || refreshKey || !initialData) void load();
    else if (processing) timer = setTimeout(load, 5000);
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelled = true; controller?.abort(); if (timer) clearTimeout(timer); document.removeEventListener("visibilitychange", visibility); };
  }, [sourceId, offset, refreshKey, processing, initialData]);

  const snapshot = data?.logs.find((log) => log.evidence);
  const logs = (data?.logs ?? []).filter((log) => !date || jakartaDay(log.detectedAt) === date);
  const violationRate = data?.rate === null || data?.rate === undefined ? null : 100 - data.rate;

  function control() {
    if (!data || pending) return;
    setActionError(null);
    startTransition(async () => {
      try {
        const result = await controlAnalysis(sourceId, processing ? "stop" : "start");
        if (!result.success) setActionError(result.message);
        setOffset(0); setRefreshKey((value) => value + 1);
      } catch { setActionError("Status permintaan belum dapat dikonfirmasi. Muat ulang sebelum mencoba lagi."); }
    });
  }
  return (
    <section className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg bg-[#EEEAF0] px-3 py-2 text-xs text-[#4D0077]"><ArrowLeft size={14} />Kembali</Link>
      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><h1 className="text-2xl font-semibold text-zinc-900">{data?.source.name ?? "Analisis Kepatuhan APD"}</h1><p className="mt-2 text-sm text-zinc-500">{data?.source.locationName} · Verifikasi keselamatan dan kelengkapan proteksi kerja.</p></div>
        <div className="flex gap-2"><Button size="sm" variant="secondary" disabled={loading || pending} onClick={() => setRefreshKey((value) => value + 1)}>Perbarui</Button>
          {data && <Button size="sm" isLoading={pending} onClick={control}>{processing ? "Hentikan Analisis" : "Mulai Analisis"}</Button>}</div>
      </header>
      {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      {actionError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{actionError}</p>}
      {data && <>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(240px,1fr)]">
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-white">
            {snapshot ? <><EvidenceImage key={snapshot.id} log={snapshot} /><button type="button" aria-label="Perbesar dokumentasi" onClick={() => setExpanded(snapshot)} className="absolute bottom-3 right-3 rounded-lg bg-black/50 p-2 text-white"><Maximize2 size={18} /></button></>
              : <div className="p-8 text-center text-zinc-400"><Video size={48} strokeWidth={1.2} className="mx-auto mb-3" /><p className="text-sm">Belum ada snapshot deteksi.</p><p className="mt-2 text-xs">Tayangan video langsung belum tersedia.</p></div>}
            <span className="absolute left-3 top-3 rounded bg-white/90 px-2 py-1 text-[11px] text-zinc-700">{data.session ? statusNames[data.session.status] : "Belum ada sesi"}</span>
          </div>
          <aside className="flex flex-col items-center justify-center rounded-xl bg-white p-6 text-center">
            <h2 className="text-sm font-medium">Rangkuman Analisis</h2>
            <p className="mt-1 text-xs text-zinc-400">{data.session ? timestamp(data.session.started_at || data.session.created_at, true) : "Belum ada data"}</p>
            <div className="my-6 flex h-36 w-36 items-center justify-center rounded-full p-2" style={{ background: violationRate === null ? "#EEEAF0" : `conic-gradient(#ef4444 ${violationRate}%, #bfdbfe 0)` }}>
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl">{violationRate === null ? "—" : `${violationRate}%`}</strong><span className="text-xs text-zinc-500">Pelanggaran</span></div>
            </div>
            <p className="text-xs text-zinc-700">{data.total} deteksi orang pada sesi ini</p>
            <div className="mt-3 flex gap-6 text-xs text-zinc-500"><span>{data.compliant} Patuh</span><span>{data.violations} Melanggar</span></div>
          </aside>
        </div>
        <p className="text-xs text-zinc-400">{snapshot ? `Snapshot dokumentasi ${timestamp(snapshot.detectedAt, true)}, ${timestamp(snapshot.detectedAt)} WIB.` : "Snapshot akan tersedia jika backend mencatat pelanggaran."} {processing && "Data diperbarui tiap 5 detik saat tab aktif."}</p>
        {data.session?.error_message && <p role="alert" className="text-sm text-red-600">{data.session.error_message}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-xs text-zinc-500">{loading ? "Memperbarui data..." : data.logs.length ? `Catatan ${offset + 1}–${offset + data.logs.length} · WIB` : "Belum ada catatan · WIB"}</p>
          <label className="flex items-center gap-2 text-xs text-zinc-500">Tanggal pada halaman ini<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-lg border border-zinc-100 bg-white px-3 py-2" /></label>
        </div>
        <div className="overflow-hidden rounded-xl bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#EEEAF0]"><tr>{["ID", "Waktu", "Tanggal", "Catatan Pelanggaran", "Dokumentasi"].map((header) => <th key={header} className="px-4 py-4 font-medium">{header}</th>)}</tr></thead>
          <tbody>{logs.map((log) => <tr key={log.id} className="border-t border-zinc-100"><td className="px-4 py-4">#{log.id}</td><td className="px-4 py-4">{timestamp(log.detectedAt)} WIB</td><td className="px-4 py-4">{timestamp(log.detectedAt, true)}</td><td className="px-4 py-4">{log.violation}</td><td className="px-4 py-4"><button type="button" disabled={!log.evidence} onClick={() => setExpanded(log)} className="rounded-full bg-[#EEEAF0] px-5 py-1 text-[#4D0077] disabled:opacity-40">Lihat</button></td></tr>)}</tbody>
        </table></div>{!logs.length && <EmptyState title="Belum Ada Catatan Pelanggaran" description={date ? "Tidak ada catatan pada tanggal ini di halaman yang sedang ditampilkan." : "Catatan muncul setelah analisis mendeteksi pelanggaran APD."} />}</div>
        <div className="flex justify-end gap-3"><Button size="sm" variant="secondary" disabled={offset === 0 || loading} onClick={() => setOffset((value) => Math.max(0, value - 20))}>Sebelumnya</Button><Button size="sm" variant="secondary" disabled={!data.hasMore || loading} onClick={() => setOffset((value) => value + 20)}>Berikutnya</Button></div>
      </>}
      {expanded && <Modal open onClose={() => setExpanded(null)} title="Dokumentasi Pelanggaran" description={`${timestamp(expanded.detectedAt, true)}, ${timestamp(expanded.detectedAt)} WIB`} wide>
        <EvidenceImage key={expanded.id} log={expanded} large /><button type="button" onClick={() => setExpanded(null)} className="mt-4 inline-flex items-center gap-2 text-sm text-[#4D0077]"><X size={15} />Tutup</button>
      </Modal>}
    </section>
  );
}
