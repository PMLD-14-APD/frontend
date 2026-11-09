export interface Option { id: string; name: string }
export interface SourceCard extends Option {
  locationId: string | null;
  locationName: string;
  sourceType: "cctv_stream" | "video_upload";
  status: string;
}
export interface MonitoringData { sources: SourceCard[]; locations: Option[]; environments: Option[] }
export interface AnalysisSession {
  id: string; status: "queued" | "processing" | "done" | "failed";
  started_at: string | null; created_at: string; error_message: string | null;
}
export interface Detection {
  id: number; detectedAt: string; violation: string; evidence: boolean;
}
export interface AnalysisData {
  source: SourceCard; session: AnalysisSession | null;
  total: number; compliant: number; violations: number; rate: number | null;
  logs: Detection[]; hasMore: boolean; offset: number;
}
