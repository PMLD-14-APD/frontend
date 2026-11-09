import { redirect } from "next/navigation";
import MonitoringClient from "@/components/monitoring/MonitoringClient";
import { getMonitoring } from "@/lib/monitoring";
import { BackendError } from "@/lib/backend";
import type { MonitoringData } from "@/type/monitoring";

export default async function DashboardPage() {
  let data: MonitoringData = { sources: [], locations: [], environments: [] };
  let error: string | null = null;
  try { data = await getMonitoring(); }
  catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    error = cause instanceof BackendError ? cause.message : "Gagal memuat sumber pemantauan.";
  }
  return <MonitoringClient data={data} error={error} />;
}
