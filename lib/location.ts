import "server-only";

import { backendRequest, BackendError } from "./backend";
import { readBackendList } from "./backend-list";
import type { LocationRow } from "@/type/location";

export async function getLocations(): Promise<LocationRow[]> {
  const [locations, sources] = await Promise.all([
    backendRequest("/locations/"),
    readBackendList("/video-sources/"),
  ]);
  if (!Array.isArray(locations) || !Array.isArray(sources) ||
    !locations.every((item) => item && typeof item.id === "string" && typeof item.name === "string") ||
    !sources.every((item) => item && typeof item === "object" &&
      "name" in item && typeof item.name === "string" &&
      "location_id" in item && (item.location_id === null || typeof item.location_id === "string") &&
      "source_type" in item && ["cctv_stream", "video_upload"].includes(String(item.source_type)))) {
    throw new BackendError("Respons data lokasi atau kamera tidak valid.", 502);
  }
  const cameras = new Map<string, string[]>();
  for (const source of sources as { source_type: string; location_id: string | null; name: string }[]) {
    if (source.source_type !== "cctv_stream" || !source.location_id) continue;
    const names = cameras.get(source.location_id) ?? [];
    names.push(source.name);
    cameras.set(source.location_id, names);
  }
  // Only expose fields needed by the table; never send stream URLs to the client.
  return locations.map((item) => ({ id: item.id, name: item.name, cameraNames: cameras.get(item.id) ?? [] }));
}
