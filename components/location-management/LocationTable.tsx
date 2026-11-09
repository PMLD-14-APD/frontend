"use client";

import { Pencil, Trash2 } from "lucide-react";
import DataTable from "../ui/DataTable";
import type { LocationRow } from "@/type/location";

interface Props {
  locations: LocationRow[];
  searching: boolean;
  disabled: boolean;
  onEdit: (location: LocationRow) => void;
  onDelete: (location: LocationRow) => void;
}

export default function LocationTable({ locations, searching, disabled, onEdit, onDelete }: Props) {
  return (
    <DataTable
      items={locations}
      getRowKey={(location) => location.id}
      headerClassName="bg-[#EEEAF0]"
      emptyState={{
        title: searching ? "Lokasi Tidak Ditemukan" : "Belum Ada Lokasi Terdaftar",
        description: searching ? "Coba kata kunci lokasi atau kamera lainnya." : "Tambahkan area kerja pertama Anda untuk mulai menghubungkan kamera CCTV dan memantau APD",
      }}
      columns={[
        { key: "name", header: "Nama Lokasi", className: "px-5 py-4 text-zinc-800", render: (location) => location.name },
        { key: "cameras", header: "Jumlah Kamera", className: "w-40 px-5 py-4 text-center text-zinc-700", render: (location) => location.cameraNames.length },
        { key: "actions", header: "Aksi", className: "w-44 px-5 py-4 text-center", render: (location) => (
          <div className="flex items-center justify-center gap-2">
            <button type="button" disabled={disabled} onClick={() => onEdit(location)} aria-label={`Ubah lokasi ${location.name}`}
              className="inline-flex items-center gap-1 rounded-full bg-[#EEEAF0] px-2.5 py-1 text-xs text-[#4D0077] hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Pencil size={13} /> Ubah
            </button>
            <button type="button" disabled={disabled} onClick={() => onDelete(location)} aria-label={`Hapus lokasi ${location.name}`}
              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        ) },
      ]}
    />
  );
}
