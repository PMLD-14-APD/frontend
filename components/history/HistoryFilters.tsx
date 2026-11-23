"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search } from "lucide-react";

type Option = { id: string; name: string };
export type HistoryFilterValues = {
  search: string; location_id: string; source_id: string; apd_class_id: string; date_from: string; date_to: string;
};

const field = "w-full rounded-lg border border-zinc-100 bg-white px-3 py-2.5 text-sm text-zinc-700";
const SEARCH_DELAY_MS = 400;
const EMPTY: HistoryFilterValues = { search: "", location_id: "", source_id: "", apd_class_id: "", date_from: "", date_to: "" };

function queryOf(values: HistoryFilterValues): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    const v = key === "search" ? value.trim() : value;
    if (v) params.set(key, v);
  }
  return params.toString();
}

/** Filter riwayat yang langsung diterapkan: pilih/ketik -> URL diganti -> halaman server memuat ulang data. */
export default function HistoryFilters({ path, initial, locations, cameras, classes }: {
  path: string; initial: HistoryFilterValues; locations: Option[]; cameras: Option[]; classes: Option[];
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [pending, startTransition] = useTransition();
  const pushed = useRef(queryOf(initial));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const initialQuery = queryOf(initial);

  // Navigasi dari luar (Reset, tombol back browser): samakan isi filter dengan URL.
  useEffect(() => {
    if (initialQuery !== pushed.current) { pushed.current = initialQuery; setValues(initial); }
  }, [initialQuery, initial]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function apply(next: HistoryFilterValues) {
    clearTimeout(timer.current);
    const query = queryOf(next);
    if (query === pushed.current) return;
    pushed.current = query;                      // ganti filter = kembali ke halaman pertama (tanpa offset)
    startTransition(() => router.replace(query ? `${path}?${query}` : path, { scroll: false }));
  }
  function change(key: keyof HistoryFilterValues, value: string) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (key !== "search") { apply(next); return; }
    clearTimeout(timer.current);                 // ketik: tunggu jeda singkat supaya tidak memuat tiap huruf
    timer.current = setTimeout(() => apply(next), SEARCH_DELAY_MS);
  }
  function reset() { setValues(EMPTY); apply(EMPTY); }

  const filtered = initialQuery !== "" || queryOf(values) !== "";
  const { date_from: from, date_to: to } = values;
  return (
    <div role="search" aria-busy={pending} className="flex flex-wrap items-start gap-3">
      <label className="relative min-w-48 flex-1">
        <Search size={16} className="pointer-events-none absolute left-3 top-3 text-zinc-400" />
        <input value={values.search} onChange={(e) => change("search", e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") apply(values); }}
          maxLength={100} aria-label="Cari lokasi atau kamera" placeholder="Cari lokasi atau kamera..." className={`${field} pl-9`} />
      </label>
      <details className="relative">
        <summary className={`${field} flex cursor-pointer list-none items-center gap-2`}>
          {from || to ? `${from || "Awal"} – ${to || "Akhir"}` : "Rentang Tanggal"} <CalendarDays size={16} />
        </summary>
        <div className="absolute left-0 z-10 mt-2 grid w-60 gap-2 rounded-xl border border-zinc-100 bg-white p-4 text-sm shadow-lg">
          <label>Dari tanggal<input type="date" value={from} max={to || undefined} onChange={(e) => change("date_from", e.target.value)} className={field} /></label>
          <label>Sampai tanggal<input type="date" value={to} min={from || undefined} onChange={(e) => change("date_to", e.target.value)} className={field} /></label>
          {(from || to) && <button type="button" onClick={() => { const next = { ...values, date_from: "", date_to: "" }; setValues(next); apply(next); }}
            className="justify-self-start text-xs text-[#4D0077]">Hapus tanggal</button>}
        </div>
      </details>
      <select aria-label="Lokasi" value={values.location_id} onChange={(e) => change("location_id", e.target.value)} className={`${field} w-auto max-w-48`}>
        <option value="">Semua Lokasi</option>
        {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select aria-label="Kamera" value={values.source_id} onChange={(e) => change("source_id", e.target.value)} className={`${field} w-auto max-w-48`}>
        <option value="">Semua Kamera</option>
        {cameras.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
      <select aria-label="Jenis APD yang tidak dipakai" value={values.apd_class_id} onChange={(e) => change("apd_class_id", e.target.value)} className={`${field} w-auto max-w-44`}>
        <option value="">Semua Jenis APD</option>
        {classes.map((item) => <option key={item.id} value={item.id}>Tanpa {item.name}</option>)}
      </select>
      {filtered && <button type="button" onClick={reset} className="px-2 py-2.5 text-sm text-[#4D0077]">Reset</button>}
      <span role="status" aria-live="polite" className="self-center text-xs text-zinc-400">{pending ? "Memuat..." : ""}</span>
    </div>
  );
}
