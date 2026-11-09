export { validLocationId as validId } from "./location-validation";
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
export const VIDEO_ACCEPT = ".mp4,.avi,.mov,.mkv,.webm";

export function cameraUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  try {
    const url = new URL(input.trim());
    return ["rtsp:", "rtsps:", "http:", "https:"].includes(url.protocol) && url.hostname ? url.href : null;
  } catch { return null; }
}

export function sourceName(input: unknown): string | null {
  return typeof input === "string" && input.trim() ? input.trim() : null;
}

export function jakartaDay(value: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}
