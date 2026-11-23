import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import DataTable from "@/components/ui/DataTable";
import EvidenceButton from "@/components/monitoring/EvidenceButton";
import HistoryFilters from "@/components/history/HistoryFilters";
import { backendRequest, BackendError } from "@/lib/backend";
import { readBackendList } from "@/lib/backend-list";
import { validId } from "@/lib/monitoring-validation";

type Option = { id: string; name: string };
type Camera = Option & { location_id: string | null };
type Violation = {
  id: number;
  location_name: string | null;
  source_name: string;
  detected_at: string;
  violation_label: string;
  image_url: string | null;
};
type ViolationPage = { total: number; items: Violation[] };
type Query = Record<string, string | string[] | undefined>;

const path = "/dashboard/history";
const limit = 20;
const dateFormat = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" });
const timeFormat = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" });

function dateParam(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
}

export default async function HistoryPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams;
  const read = (key: string) => typeof query[key] === "string" ? query[key] : "";
  const search = read("search").trim().slice(0, 100);
  const location = read("location_id");
  const source = read("source_id");
  const apdClass = read("apd_class_id");
  const from = dateParam(read("date_from"));
  const to = dateParam(read("date_to"));
  const rawOffset = Number(read("offset"));
  const offset = Number.isSafeInteger(rawOffset) && rawOffset >= 0 && rawOffset <= 2_147_483_600 ? rawOffset : 0;
  const filters = new URLSearchParams();
  if (search) filters.set("search", search);
  if (validId(location)) filters.set("location_id", location);
  if (validId(source)) filters.set("source_id", source);
  if (validId(apdClass)) filters.set("apd_class_id", apdClass);
  if (from) filters.set("date_from", from);
  if (to) filters.set("date_to", to);
  const filtered = filters.size > 0;
  const params = new URLSearchParams(filters);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  const pageLink = (next: number) => `${path}?${new URLSearchParams([...filters, ["offset", String(next)]])}`;

  let data: ViolationPage = { total: 0, items: [] };
  let locations: Option[] = [];
  let cameras: Camera[] = [];
  let classes: Option[] = [];
  let error = from && to && from > to ? "Tanggal awal harus sebelum atau sama dengan tanggal akhir." : "";

  try {
    const [loc, sources, apd, result] = await Promise.all([
      backendRequest("/locations/"),
      readBackendList("/video-sources/?source_type=cctv_stream"),
      backendRequest("/apd-classes/"),
      error ? Promise.resolve(null) : backendRequest(`/history/violations?${params}`),
    ]);
    if (!Array.isArray(loc) || !Array.isArray(apd)) throw new BackendError("Respons filter tidak valid.", 502);
    locations = loc;
    cameras = sources as Camera[];
    classes = apd;
    if (result) {
      if (typeof result !== "object" || !("items" in result) || !Array.isArray(result.items) ||
        !("total" in result) || typeof result.total !== "number") {
        throw new BackendError("Respons riwayat tidak valid.", 502);
      }
      data = { items: result.items, total: result.total };
    }
  } catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    error = cause instanceof BackendError ? cause.message : "Gagal memuat riwayat pelanggaran.";
  }
  if (!error && offset > 0 && offset >= data.total) {
    redirect(pageLink(Math.max(0, Math.floor((data.total - 1) / limit) * limit)));
  }

  return (
    <section className="space-y-6">
      <PageHeader title="Daftar Pelanggaran APD" description="Daftar log pelanggaran keselamatan kerja yang terdeteksi secara otomatis oleh sistem kamera pemantau" />
      <HistoryFilters path={path} locations={locations} cameras={cameras} classes={classes}
        initial={{ search, location_id: validId(location) ? location : "", source_id: validId(source) ? source : "",
          apd_class_id: validId(apdClass) ? apdClass : "", date_from: from, date_to: to }} />
      {error ? <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : (
        <DataTable items={data.items} getRowKey={(item) => String(item.id)} headerClassName="bg-[#EEEAF0]"
          emptyState={{
            title: filtered ? "Tidak Ada Hasil" : "Belum Ada Data Pelanggaran",
            description: filtered ? "Coba gunakan kata kunci atau filter yang berbeda." : "Saat ini belum ada rekaman pelanggaran APD yang terdeteksi oleh sistem pemantau kamera.",
          }}
          columns={[
            { key: "id", header: "ID", className: "px-4 py-3", render: (item) => `#${item.id}` },
            { key: "location", header: "Lokasi", className: "px-4 py-3", render: (item) => item.location_name ?? "Tanpa lokasi" },
            { key: "source", header: "Nama Kamera", className: "px-4 py-3", render: (item) => item.source_name },
            { key: "time", header: "Waktu", className: "whitespace-nowrap px-4 py-3", render: (item) => `${timeFormat.format(new Date(item.detected_at))} WIB` },
            { key: "date", header: "Tanggal", className: "whitespace-nowrap px-4 py-3", render: (item) => dateFormat.format(new Date(item.detected_at)) },
            { key: "violation", header: "Catatan Pelanggaran", className: "px-4 py-3", render: (item) => item.violation_label },
            { key: "evidence", header: "Dokumentasi", className: "px-4 py-3 text-center", render: (item) => item.image_url ? <EvidenceButton id={item.id} label={item.violation_label} /> : "—" },
          ]}
        />
      )}
      {!error && data.total > limit && (
        <nav aria-label="Halaman riwayat" className="flex flex-wrap items-center justify-end gap-4 text-sm text-zinc-600">
          <span>{offset + 1}–{Math.min(offset + limit, data.total)} dari {data.total}</span>
          {offset > 0 && <Link className="rounded-lg bg-white px-3 py-2" href={pageLink(Math.max(0, offset - limit))}>Sebelumnya</Link>}
          {offset + limit < data.total && <Link className="rounded-lg bg-white px-3 py-2" href={pageLink(offset + limit)}>Berikutnya</Link>}
        </nav>
      )}
    </section>
  );
}
