import LocationManagement from "@/components/location-management/LocationManagement";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getLocations } from "@/lib/location";
import { BackendError } from "@/lib/backend";
import type { LocationRow } from "@/type/location";

export default async function LocationManagementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") {
    return <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Manajemen Lokasi hanya dapat diakses oleh akun dengan peran Admin.</p>;
  }

  let locations: LocationRow[] = [];
  let error: string | null = null;
  try {
    locations = await getLocations();
  } catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    error = cause instanceof BackendError ? cause.message : "Gagal memuat lokasi. Silakan coba lagi.";
  }
  return <LocationManagement locations={locations} initialError={error} />;
}
