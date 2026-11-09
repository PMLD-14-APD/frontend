import "server-only";
import { backendRequest, BackendError } from "./backend";
import { readBackendList } from "./backend-list";
import type { AnalysisData, MonitoringData, SourceCard } from "@/type/monitoring";

function rows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value) || !value.every((item) => item && typeof item === "object")) throw new BackendError("Respons backend tidak valid.", 502);
  return value;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new BackendError("Respons backend tidak valid.", 502);
  return value;
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) throw new BackendError("Respons statistik tidak valid.", 502);
  return value;
}
function sourceCard(item: Record<string, unknown>, locationName: string): SourceCard {
  if (!["cctv_stream", "video_upload"].includes(String(item.source_type))) throw new BackendError("Jenis sumber tidak valid.", 502);
  return { id: text(item.id), name: text(item.name), locationId: item.location_id === null ? null : text(item.location_id),
    locationName, sourceType: item.source_type as SourceCard["sourceType"], status: text(item.status) };
}

export async function getMonitoring(): Promise<MonitoringData> {
  const [sources, locations, environments] = await Promise.all([
    readBackendList("/video-sources/"), backendRequest("/locations/"), backendRequest("/environments/"),
  ]);
  const options = rows(locations).map((item) => ({ id: text(item.id), name: text(item.name) }));
  return {
    sources: rows(sources).map((item) => sourceCard(item, options.find((location) => location.id === item.location_id)?.name ?? "Tanpa lokasi")),
    locations: options,
    environments: rows(environments).map((item) => ({ id: text(item.id), name: text(item.name) })),
  };
}

export async function latestSession(sourceId: string): Promise<Record<string, unknown> | undefined> {
  const [active, recent] = await Promise.all([
    backendRequest(`/analysis-sessions/?source_id=${sourceId}&status=processing&limit=1`),
    backendRequest(`/analysis-sessions/?source_id=${sourceId}&limit=1`),
  ]);
  return rows(active)[0] ?? rows(recent)[0];
}

export async function getAnalysis(sourceId: string, offset = 0): Promise<AnalysisData> {
  // Backend performs ownership checks before any related data is exposed.
  const raw = await backendRequest(`/video-sources/${sourceId}`);
  if (!raw || typeof raw !== "object") throw new BackendError("Sumber tidak valid.", 502);
  const item = raw as Record<string, unknown>;
  const [sessions, location] = await Promise.all([
    latestSession(sourceId),
    item.location_id ? backendRequest(`/locations/${text(item.location_id)}`) : Promise.resolve(null),
  ]);
  const source = sourceCard(item, location && typeof location === "object" && "name" in location ? text(location.name) : "Tanpa lokasi");
  const latest = sessions;
  if (!latest) return { source, session: null, total: 0, compliant: 0, violations: 0, rate: null, logs: [], hasMore: false, offset };
  const sessionId = text(latest.id);
  if (!["queued", "processing", "done", "failed"].includes(String(latest.status))) throw new BackendError("Status analisis tidak valid.", 502);
  const [stats, logs] = await Promise.all([
    backendRequest(`/analysis-sessions/${sessionId}/stats`),
    backendRequest(`/detection-logs/?session_id=${sessionId}&limit=21&offset=${offset}`),
  ]);
  const totals = rows(stats).reduce<{ total: number; compliant: number }>((sum, stat) => ({ total: sum.total + number(stat.total_persons), compliant: sum.compliant + number(stat.lengkap) }), { total: 0, compliant: 0 });
  const detections = rows(logs);
  return { source, session: { id: sessionId, status: latest.status as NonNullable<AnalysisData["session"]>["status"],
      created_at: text(latest.created_at), started_at: latest.started_at === null ? null : text(latest.started_at),
      error_message: latest.status === "failed" ? "Analisis gagal. Periksa koneksi sumber dan konfigurasi model AI pada backend." : null },
    total: totals.total, compliant: totals.compliant, violations: Math.max(0, totals.total - totals.compliant),
    rate: totals.total ? Math.round(totals.compliant / totals.total * 100) : null,
    logs: detections.slice(0, 20).map((log) => ({ id: number(log.id), detectedAt: text(log.detected_at), violation: text(log.violation_type), evidence: typeof log.image_url === "string" && log.image_url.length > 0 })),
    hasMore: detections.length > 20, offset,
  };
}
