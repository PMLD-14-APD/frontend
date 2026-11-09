import { notFound, redirect } from "next/navigation";
import { BackendError } from "@/lib/backend";
import { getAnalysis } from "@/lib/monitoring";
import { validId } from "@/lib/monitoring-validation";
import AnalysisClient from "@/components/monitoring/AnalysisClient";
import type { AnalysisData } from "@/type/monitoring";

export default async function AnalysisPage({ params }: { params: Promise<{ sourceId: string }> }) {
  const { sourceId } = await params;
  if (!validId(sourceId)) notFound();
  let data: AnalysisData | null = null;
  let error: string | null = null;
  try { data = await getAnalysis(sourceId); }
  catch (cause) {
    if (cause instanceof BackendError && cause.status === 401) redirect("/");
    if (cause instanceof BackendError && cause.status === 404) notFound();
    error = cause instanceof BackendError ? cause.message : "Gagal memuat analisis.";
  }
  return <AnalysisClient key={sourceId} sourceId={sourceId} initialData={data} initialError={error} />;
}
