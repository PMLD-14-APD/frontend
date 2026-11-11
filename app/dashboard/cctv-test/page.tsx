import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BackendError } from "@/lib/backend";
import { listCctv, type CctvCamera } from "@/lib/cctv";
import CctvTestClient from "@/components/monitoring/CctvTestClient";

export default async function CctvTestPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  if (user.role !== "admin") {
    return <p role="alert" className="text-sm text-red-600">Tes koneksi CCTV hanya tersedia untuk Super Admin.</p>;
  }
  let cameras: CctvCamera[] = [];
  let error: string | null = null;
  try {
    cameras = await listCctv();
  } catch (cause) {
    error = cause instanceof BackendError ? cause.message : "Gagal membaca layanan CCTV.";
  }
  return <CctvTestClient initialCameras={cameras} initialError={error} />;
}
