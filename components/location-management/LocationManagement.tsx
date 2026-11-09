"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "../ui/PageHeader";
import Button from "../ui/Button";
import { Plus } from "lucide-react";
import SearchInput from "../ui/SearchInput";
import LocationTable from "./LocationTable";
import LocationDialog, { type LocationDialogState } from "./LocationDialog";
import type { LocationRow } from "@/type/location";

export default function LocationManagement({ locations, initialError, canEdit }: { locations: LocationRow[]; initialError: string | null; canEdit: boolean }) {
    const [search, setSearch] = useState("");
    const [dialog, setDialog] = useState<LocationDialogState | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const filtered = useMemo(() => {
        const query = search.trim().toLocaleLowerCase("id");
        return locations.filter((location) => location.name.toLocaleLowerCase("id").includes(query) ||
            location.cameraNames.some((name) => name.toLocaleLowerCase("id").includes(query)));
    }, [locations, search]);
    return (
        <section className="space-y-7">
            <PageHeader
            title="Manajemen Lokasi"
            description={canEdit
                ? "Tambah dan perbarui daftar area kerja di seluruh titik operasional untuk penempatan kamera pengawas."
                : "Lihat daftar lokasi penempatan kamera pengawas."}
            />
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <SearchInput placeholder="Cari berdasarkan lokasi atau kamera..."
                className="max-w-[440px]"
                value={search}
                onChange={setSearch}
                />
                {canEdit && <Button
                    icon={<Plus size={16} />}
                    onClick={() => setDialog({ mode: "create" })}
                    disabled={isPending}
                >
                    Tambah Lokasi
                </Button>}
            </div>
            {initialError ? (
                <div role="alert" className="space-y-3 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                    <p>{initialError}</p>
                    <Button variant="secondary" size="sm" disabled={isPending} onClick={() => startTransition(() => router.refresh())}>
                        {isPending ? "Memuat..." : "Coba Lagi"}
                    </Button>
                </div>
            ) : (
                <LocationTable locations={filtered} searching={!!search.trim()} disabled={isPending} canEdit={canEdit}
                    onEdit={(location) => setDialog({ mode: "edit", location })}
                    onDelete={(location) => setDialog({ mode: "delete", location })} />
            )}
            {canEdit && dialog && <LocationDialog key={dialog.mode === "create" ? "create" : `${dialog.mode}-${dialog.location.id}`}
                dialog={dialog} onClose={() => setDialog(null)} />}
        </section>

    )
}
