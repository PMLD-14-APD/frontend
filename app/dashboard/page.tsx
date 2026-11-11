import { redirect } from "next/navigation";
import MonitoringClient from "@/components/monitoring/MonitoringClient";
import { getMonitoring } from "@/lib/monitoring";
import { BackendError } from "@/lib/backend";
import type { MonitoringData } from "@/type/monitoring";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  let data: MonitoringData = { sources: [], locations: [], environments: [] };
  let error: string | null = null;
  try { data = await getMonitoring(); }
  catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    error = cause instanceof BackendError ? cause.message : "Gagal memuat sumber pemantauan.";
  }
  return (
    <>
      {user.role === "admin" && (
        <div className="mb-5 flex justify-end">
          <Link href="/dashboard/cctv-test" className="rounded-lg bg-[#EEEAF0] px-4 py-2 text-sm text-[#4D0077]">
            Tes Koneksi CCTV
          </Link>
        </div>
      )}
      <MonitoringClient data={data} error={error} />
    </>
  );
}
